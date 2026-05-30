"""
test/test_send_failure_no_update.py

Verify that a failed SMTP send does NOT update the invoice ledger.

Scenario:
  - Mock smtplib.SMTP to raise SMTPAuthenticationError.
  - Call process_invoice for a known invoice.
  - Assert followup_count and last_followup_date are UNCHANGED in the CSV.
  - Assert the audit log contains a FAILED entry.

Run with: python -m pytest test/test_send_failure_no_update.py -v
"""

import json
import os
import shutil
import tempfile
from datetime import date
from smtplib import SMTPAuthenticationError
from unittest.mock import patch, MagicMock

import pandas as pd

from src import config, logger
from src.data_loader import load_invoices


# ── Fixtures ──────────────────────────────────────────────────────────────────

TARGET_INVOICE = "INV-1013"

# Canned LLM response that _parse_email_output can parse
_CANNED_LLM_RESPONSE = "Subject: Payment Reminder for INV-1006\n\nBody:\nDear Client,\n\nThis is a reminder that your invoice INV-1006 remains unpaid. Please arrange payment at your earliest convenience.\n\nBest regards,\nFinance Department"


def _make_temp_csv():
    """Copy the real dataset CSV to a temp file and return its path."""
    tmp = tempfile.mktemp(suffix=".csv")
    shutil.copy(config.DATA_PATH, tmp)
    return tmp


# ── Test ──────────────────────────────────────────────────────────────────────

def test_smtp_auth_failure_does_not_update_csv():
    """
    When SMTP raises SMTPAuthenticationError, process_invoice must:
    1. NOT increment followup_count.
    2. NOT change last_followup_date.
    3. Write a FAILED audit row with the error string.
    """
    tmp_csv = _make_temp_csv()

    try:
        # Snapshot BEFORE
        df_before = load_invoices(tmp_csv)
        mask = df_before["invoice_no"] == TARGET_INVOICE
        count_before = int(df_before.loc[mask, "followup_count"].iloc[0])
        date_before = df_before.loc[mask, "last_followup_date"].iloc[0]

        # Reset the in-memory audit log
        logger.reset()

        # Mock LLM response
        mock_llm_response = MagicMock()
        mock_llm_response.content = _CANNED_LLM_RESPONSE

        mock_llm_instance = MagicMock()
        mock_llm_instance.invoke.return_value = mock_llm_response

        with (
            patch.object(config, "DRY_RUN", False),
            patch.object(config, "DATA_PATH", tmp_csv),
            patch("smtplib.SMTP") as mock_smtp,
            patch("src.tools._get_llm", return_value=mock_llm_instance),
        ):
            # Make SMTP raise on login
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__ = MagicMock(return_value=mock_server)
            mock_smtp.return_value.__exit__ = MagicMock(return_value=False)
            mock_server.login.side_effect = SMTPAuthenticationError(
                535, b"5.7.8 Username and Password not accepted."
            )

            # Import here so the @tool decorator is already applied
            from src.tools import process_invoice

            raw_result = process_invoice.invoke(TARGET_INVOICE)
            result = json.loads(raw_result)

        # ── Assertions on the pipeline result ─────────────────────────────
        assert result["send_status"] == "error", (
            f"Expected send_status='error', got '{result['send_status']}'"
        )
        assert result["record_update"] == "skipped", (
            f"Expected record_update='skipped', got '{result['record_update']}'"
        )

        # ── Assertions on the CSV — must be UNCHANGED ─────────────────────
        df_after = load_invoices(tmp_csv)
        mask_after = df_after["invoice_no"] == TARGET_INVOICE
        count_after = int(df_after.loc[mask_after, "followup_count"].iloc[0])
        date_after = df_after.loc[mask_after, "last_followup_date"].iloc[0]

        assert count_after == count_before, (
            f"followup_count changed! before={count_before}, after={count_after}"
        )
        # Compare dates — both may be NaT or a Timestamp
        if pd.isna(date_before):
            assert pd.isna(date_after), (
                f"last_followup_date changed from NaT to {date_after}"
            )
        else:
            assert date_after == date_before, (
                f"last_followup_date changed! before={date_before}, after={date_after}"
            )

        # ── Assertions on the audit log — must contain a FAILED row ──────
        summary = logger.get_summary()
        failed_entries = [
            e for e in summary["log"]
            if e["invoice_no"] == TARGET_INVOICE and e["result"] == "FAILED"
        ]
        assert len(failed_entries) >= 1, (
            f"Expected at least one FAILED audit entry for {TARGET_INVOICE}, "
            f"found {len(failed_entries)}. Full log: {summary['log']}"
        )
        # The FAILED entry should mention the SMTP error
        assert "Username and Password not accepted" in failed_entries[0]["reason"], (
            f"FAILED reason doesn't mention the SMTP error: {failed_entries[0]['reason']}"
        )

        print(f"\n    PASS  followup_count unchanged: {count_before}")
        print(f"    PASS  last_followup_date unchanged: {date_before}")
        print(f"    PASS  FAILED audit row written with SMTP error")
        print(f"    PASS  record_update='skipped'")
        print(f"    PASS  send_status='error'")
        print("\nTEST PASSED: SMTP failure does NOT update the CSV ledger.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)


# Allow running as a standalone script as well
if __name__ == "__main__":
    test_smtp_auth_failure_does_not_update_csv()
