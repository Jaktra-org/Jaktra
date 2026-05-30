"""
test/test_idempotency.py

Verify that the idempotency guard prevents duplicate emails for invoices
that were already successfully emailed within the configured window.

Scenario:
  1. Create a fake audit-log report containing a successful "sent" entry
     for invoice X dated 2 hours ago.
  2. Run the agent (with mocked LLM/emailer) for a batch that includes X.
  3. Assert that invoice X is NOT re-emailed (process_invoice never called).
  4. Assert the audit log contains a "SKIPPED (idempotent)" entry for X.

Run with:  python -m pytest test/test_idempotency.py -v
"""

import json
import os
import shutil
import tempfile
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock

from src import config, logger
from src.idempotency import is_recently_sent, get_last_send_time


# ── Fixtures ──────────────────────────────────────────────────────────────────

TARGET_INVOICE = "INV-1013"

_RECENT_TIMESTAMP = (
    datetime.now(tz=timezone.utc) - timedelta(hours=2)
).isoformat()

_OLD_TIMESTAMP = (
    datetime.now(tz=timezone.utc) - timedelta(hours=25)
).isoformat()

# Canned LLM response that _parse_email_output can parse
_CANNED_LLM_RESPONSE = (
    "Subject: Payment Reminder for INV-0939\n\n"
    "Body:\nDear Client,\n\n"
    "This is a reminder that your invoice INV-0939 remains unpaid. "
    "Please arrange payment at your earliest convenience.\n\n"
    "Best regards,\nFinance Department"
)


def _make_temp_output_dir():
    """Create a temp directory to act as the outputs folder."""
    return tempfile.mkdtemp(prefix="idempotency_test_")


def _write_fake_report(output_dir: str, invoice_id: str, timestamp: str):
    """Write a minimal run_report JSON with a successful send entry."""
    report = {
        "total_processed": 1,
        "total_sent": 1,
        "total_skipped": 0,
        "total_errors": 0,
        "log": [
            {
                "timestamp": timestamp,
                "invoice_no": invoice_id,
                "action": "email_sent",
                "result": "sent",
                "reason": f"to=test@example.com | status=sent",
            }
        ],
    }
    ts_slug = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = os.path.join(output_dir, f"run_report_{ts_slug}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    return path


# ── Unit tests for the is_recently_sent helper ───────────────────────────────

class TestIsRecentlySent:
    """Direct tests for the is_recently_sent and get_last_send_time helpers."""

    def test_recent_send_returns_true(self):
        """An entry within the window should return True."""
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, TARGET_INVOICE, _RECENT_TIMESTAMP)
            assert is_recently_sent(TARGET_INVOICE, tmp_dir, window_hours=20) is True
        finally:
            shutil.rmtree(tmp_dir)

    def test_old_send_returns_false(self):
        """An entry outside the window should return False."""
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, TARGET_INVOICE, _OLD_TIMESTAMP)
            assert is_recently_sent(TARGET_INVOICE, tmp_dir, window_hours=20) is False
        finally:
            shutil.rmtree(tmp_dir)

    def test_different_invoice_returns_false(self):
        """A send for a different invoice should not match."""
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, "INV-9999", _RECENT_TIMESTAMP)
            assert is_recently_sent(TARGET_INVOICE, tmp_dir, window_hours=20) is False
        finally:
            shutil.rmtree(tmp_dir)

    def test_empty_dir_returns_false(self):
        """No reports at all should return False."""
        tmp_dir = _make_temp_output_dir()
        try:
            assert is_recently_sent(TARGET_INVOICE, tmp_dir, window_hours=20) is False
        finally:
            shutil.rmtree(tmp_dir)

    def test_nonexistent_dir_returns_false(self):
        """A missing directory should return False, not crash."""
        assert is_recently_sent(TARGET_INVOICE, "/no/such/dir", window_hours=20) is False

    def test_get_last_send_time_returns_timestamp(self):
        """get_last_send_time should return the ISO timestamp string."""
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, TARGET_INVOICE, _RECENT_TIMESTAMP)
            result = get_last_send_time(TARGET_INVOICE, tmp_dir, window_hours=20)
            assert result == _RECENT_TIMESTAMP
        finally:
            shutil.rmtree(tmp_dir)

    def test_get_last_send_time_returns_none_when_old(self):
        """get_last_send_time should return None for entries outside the window."""
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, TARGET_INVOICE, _OLD_TIMESTAMP)
            result = get_last_send_time(TARGET_INVOICE, tmp_dir, window_hours=20)
            assert result is None
        finally:
            shutil.rmtree(tmp_dir)

    def test_dry_run_also_counts_as_sent(self):
        """A 'dry_run' result should also count as a successful send."""
        tmp_dir = _make_temp_output_dir()
        try:
            report = {
                "total_processed": 1, "total_sent": 1,
                "total_skipped": 0, "total_errors": 0,
                "log": [{
                    "timestamp": _RECENT_TIMESTAMP,
                    "invoice_no": TARGET_INVOICE,
                    "action": "email_sent",
                    "result": "dry_run",
                    "reason": "to=test@example.com | status=dry_run",
                }],
            }
            ts = datetime.now(tz=timezone.utc).strftime("%Y%m%dT%H%M%SZ")
            path = os.path.join(tmp_dir, f"run_report_{ts}.json")
            with open(path, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=2)

            assert is_recently_sent(TARGET_INVOICE, tmp_dir, window_hours=20) is True
        finally:
            shutil.rmtree(tmp_dir)


# ── Integration test: agent skips idempotent invoice ──────────────────────────

def test_agent_skips_recently_sent_invoice():
    """
    End-to-end: plant a recent audit entry for TARGET_INVOICE, then run
    the agent and verify that process_invoice is NEVER called for it.

    Other invoices in the batch should still be processed normally.
    """
    tmp_output = _make_temp_output_dir()
    tmp_csv = tempfile.mktemp(suffix=".csv")
    shutil.copy(config.DATA_PATH, tmp_csv)

    try:
        # Plant a recent successful send for TARGET_INVOICE
        _write_fake_report(tmp_output, TARGET_INVOICE, _RECENT_TIMESTAMP)

        # Reset the in-memory audit log
        logger.reset()

        # Mock LLM
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

        # ── Assertions ────────────────────────────────────────────────────
        # 1. The audit log must contain a "SKIPPED (idempotent)" entry
        idempotent_entries = [
            e for e in summary["log"]
            if e["invoice_no"] == TARGET_INVOICE
            and e["action"] == "idempotency_check"
            and e["result"] == "skipped"
        ]
        assert len(idempotent_entries) == 1, (
            f"Expected exactly 1 idempotent-skip entry for {TARGET_INVOICE}, "
            f"found {len(idempotent_entries)}. Full log:\n"
            + json.dumps(summary["log"], indent=2)
        )

        skip_reason = idempotent_entries[0]["reason"]
        assert "SKIPPED (idempotent)" in skip_reason, (
            f"Skip reason doesn't mention idempotency: {skip_reason}"
        )
        assert TARGET_INVOICE in skip_reason, (
            f"Skip reason doesn't include invoice_id: {skip_reason}"
        )
        assert "last_send_time=" in skip_reason, (
            f"Skip reason doesn't include last_send_time: {skip_reason}"
        )

        # 2. process_invoice should NOT have been called for TARGET_INVOICE
        #    (no email_generated or email_sent entries for it)
        sent_entries = [
            e for e in summary["log"]
            if e["invoice_no"] == TARGET_INVOICE
            and e["action"] == "email_sent"
        ]
        assert len(sent_entries) == 0, (
            f"Invoice {TARGET_INVOICE} should NOT have been emailed, "
            f"but found {len(sent_entries)} email_sent entries."
        )

        print(f"\n    PASS  {TARGET_INVOICE} was SKIPPED (idempotent)")
        print(f"    PASS  No email_sent entries for {TARGET_INVOICE}")
        print(f"    PASS  Audit log contains idempotency skip entry")
        print("\nTEST PASSED: Idempotency guard prevents duplicate emails.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


# Allow running as a standalone script
if __name__ == "__main__":
    test_agent_skips_recently_sent_invoice()
