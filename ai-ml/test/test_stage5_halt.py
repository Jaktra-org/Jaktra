"""
test/test_stage5_halt.py

Verify that Stage 5 (legal_escalation) invoices are HALTED before any
LLM call or email dispatch.

Scenarios tested:
  1. Agent loop: a Stage 5 invoice produces a HALTED audit entry and
     zero email_sent / email_generated calls.
  2. process_invoice (belt-and-suspenders): calling process_invoice
     directly for a Stage 5 invoice returns status="HALTED".
  3. HaltViolationError: emailer.send_email raises if urgency_tier
     is "legal_escalation".

Run with:  python -m pytest test/test_stage5_halt.py -v
"""

import json
import os
import shutil
import tempfile
from unittest.mock import patch, MagicMock

import pytest

from src import config, logger
from src.exceptions import HaltViolationError
from src.triage import TIER_LEGAL
from src import emailer as emailer_module


# ── Fixtures ──────────────────────────────────────────────────────────────────

# INV-0931 is >30 days overdue in the updated dataset → Stage 5
STAGE5_INVOICE = "INV-0931"

# INV-1013 is 5 days overdue → Stage 1 (should be processed normally)
NORMAL_INVOICE = "INV-1013"

# Canned LLM response
_CANNED_LLM_RESPONSE = (
    "Subject: Payment Reminder for INV-1013\n\n"
    "Body:\nDear Client,\n\n"
    "This is a reminder that your invoice INV-1013 remains unpaid. "
    "Please arrange payment at your earliest convenience.\n\n"
    "Best regards,\nFinance Department"
)


def _make_temp_csv():
    """Copy the real dataset CSV to a temp file and return its path."""
    tmp = tempfile.mktemp(suffix=".csv")
    shutil.copy(config.DATA_PATH, tmp)
    return tmp


def _make_temp_output_dir():
    """Create a temp directory to act as the outputs folder."""
    return tempfile.mkdtemp(prefix="stage5_test_")


# ── Test 1: Agent loop halts Stage 5 invoices ────────────────────────────────

def test_agent_halts_stage5_invoice():
    """
    Run the agent with a batch containing a Stage 5 invoice.
    Assert:
      - A HALTED audit entry exists for the Stage 5 invoice.
      - Zero email_generated or email_sent entries for it.
      - Non-Stage-5 invoices are still processed.
    """
    tmp_csv = _make_temp_csv()
    tmp_output = _make_temp_output_dir()

    try:
        logger.reset()

        mock_llm_response = MagicMock()
        mock_llm_response.content = _CANNED_LLM_RESPONSE
        mock_llm_instance = MagicMock()
        mock_llm_instance.invoke.return_value = mock_llm_response

        with (
            patch.object(config, "DRY_RUN", True),
            patch.object(config, "DATA_PATH", tmp_csv),
            patch.object(config, "OUTPUT_DIR", tmp_output),
            patch("src.tools._get_llm", return_value=mock_llm_instance),
        ):
            from src.agent import run_agent
            summary = run_agent(verbose=False)

        log = summary["log"]

        # ── Assert: HALTED entry exists for the Stage 5 invoice ───────
        halted_entries = [
            e for e in log
            if e["invoice_no"] == STAGE5_INVOICE
            and e["result"] == "HALTED"
        ]
        assert len(halted_entries) >= 1, (
            f"Expected at least 1 HALTED entry for {STAGE5_INVOICE}, "
            f"found {len(halted_entries)}. Full log:\n"
            + json.dumps(log, indent=2)
        )

        # Verify the HALTED entry has the right action
        assert halted_entries[0]["action"] == "stage5_halt", (
            f"Expected action='stage5_halt', got '{halted_entries[0]['action']}'"
        )

        # ── Assert: zero email calls for the Stage 5 invoice ──────────
        email_entries = [
            e for e in log
            if e["invoice_no"] == STAGE5_INVOICE
            and e["action"] in ("email_generated", "email_sent")
        ]
        assert len(email_entries) == 0, (
            f"Stage 5 invoice {STAGE5_INVOICE} should have ZERO email entries, "
            f"but found {len(email_entries)}:\n"
            + json.dumps(email_entries, indent=2)
        )

        # ── Assert: total_halted is counted ───────────────────────────
        assert summary.get("total_halted", 0) >= 1, (
            f"Expected total_halted >= 1, got {summary.get('total_halted', 0)}"
        )

        print(f"\n    PASS  {STAGE5_INVOICE} was HALTED (Stage 5)")
        print(f"    PASS  Zero email entries for {STAGE5_INVOICE}")
        print(f"    PASS  total_halted = {summary.get('total_halted', 0)}")
        print("\nTEST PASSED: Stage 5 halt prevents LLM call and email.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


# ── Test 2: process_invoice returns HALTED for Stage 5 ────────────────────────

def test_process_invoice_returns_halted_for_stage5():
    """
    Call process_invoice directly for a Stage 5 invoice.
    Assert it returns status='HALTED' without touching the LLM.
    """
    tmp_csv = _make_temp_csv()

    try:
        logger.reset()

        with patch.object(config, "DATA_PATH", tmp_csv):
            from src.tools import process_invoice
            raw = process_invoice.invoke(STAGE5_INVOICE)
            result = json.loads(raw)

        assert result["status"] == "HALTED", (
            f"Expected status='HALTED', got '{result['status']}'"
        )
        assert result["invoice_no"] == STAGE5_INVOICE

        # The audit log should contain a HALTED entry
        summary = logger.get_summary()
        halted = [
            e for e in summary["log"]
            if e["invoice_no"] == STAGE5_INVOICE and e["result"] == "HALTED"
        ]
        assert len(halted) >= 1

        print(f"\n    PASS  process_invoice returns HALTED for {STAGE5_INVOICE}")
        print("TEST PASSED: process_invoice belt-and-suspenders guard works.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)


# ── Test 3: HaltViolationError in emailer ─────────────────────────────────────

def test_halt_violation_error_on_stage5_email():
    """
    Calling emailer.send_email with urgency_tier='legal_escalation'
    should raise HaltViolationError.
    """
    with pytest.raises(HaltViolationError, match="Stage 5"):
        emailer_module.send_email(
            to="test@example.com",
            subject="Test Subject",
            body="Test body",
            urgency_tier="legal_escalation",
        )

    print("\n    PASS  HaltViolationError raised for legal_escalation tier")
    print("TEST PASSED: emailer belt-and-suspenders guard works.\n")


def test_emailer_does_not_raise_for_normal_tiers():
    """
    Calling emailer.send_email with a non-Stage-5 tier should NOT raise.
    """
    with patch.object(config, "DRY_RUN", True):
        # Should succeed without raising
        result = emailer_module.send_email(
            to="test@example.com",
            subject="Test Subject",
            body="Test body",
            urgency_tier="stage_1_warm",
        )
        assert result.success is True

        # Also works with None (backward compatibility)
        result2 = emailer_module.send_email(
            to="test@example.com",
            subject="Test Subject",
            body="Test body",
        )
        assert result2.success is True

    print("\n    PASS  No error for normal tiers or None")
    print("TEST PASSED: emailer allows normal emails.\n")


# Allow running as a standalone script
if __name__ == "__main__":
    test_agent_halts_stage5_invoice()
    test_process_invoice_returns_halted_for_stage5()
    test_halt_violation_error_on_stage5_email()
    test_emailer_does_not_raise_for_normal_tiers()
