"""
test/test_dead_letter.py

Verify the Dead Letter Queue (DLQ) tracks consecutive failures, resets
on success, and emits DLQ_ALERT entries after the threshold is reached.

Run with:  python -m pytest test/test_dead_letter.py -v
"""

import json
import os
import shutil
import tempfile
from unittest.mock import patch, MagicMock

from src import config, logger
from src.dead_letter import DeadLetterQueue, DLQ_ALERT_THRESHOLD


# ── Fixtures ──────────────────────────────────────────────────────────────────

TARGET_INVOICE = "INV-TEST-DLQ"

# Canned LLM response
_CANNED_LLM_RESPONSE = (
    "Subject: Payment Reminder for INV-1013\n\n"
    "Body:\nDear Client,\n\n"
    "This is a reminder that your invoice INV-1013 remains unpaid. "
    "Please arrange payment at your earliest convenience.\n\n"
    "Best regards,\nFinance Department"
)


def _make_temp_dlq():
    """Create a temp DLQ file and return its path."""
    tmp_dir = tempfile.mkdtemp(prefix="dlq_test_")
    return os.path.join(tmp_dir, "dlq.json"), tmp_dir


# ── Unit tests: DeadLetterQueue class ─────────────────────────────────────────

class TestDeadLetterQueue:

    def test_increment_creates_entry(self):
        """First increment should create an entry with count=1."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            count = dlq.increment("INV-001", error="test error")
            assert count == 1
            assert dlq.get_failure_count("INV-001") == 1
            entry = dlq.get("INV-001")
            assert entry is not None
            assert entry["last_error"] == "test error"
            assert "first_failure" in entry
            assert "last_failure" in entry
        finally:
            shutil.rmtree(tmp_dir)

    def test_increment_accumulates(self):
        """Multiple increments should accumulate."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            dlq.increment("INV-001", error="err 1")
            dlq.increment("INV-001", error="err 2")
            count = dlq.increment("INV-001", error="err 3")
            assert count == 3
            assert dlq.get("INV-001")["last_error"] == "err 3"
        finally:
            shutil.rmtree(tmp_dir)

    def test_reset_removes_entry(self):
        """Reset should remove the invoice from the DLQ."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            dlq.increment("INV-001", error="err")
            dlq.increment("INV-001", error="err")
            assert "INV-001" in dlq
            dlq.reset("INV-001")
            assert "INV-001" not in dlq
            assert dlq.get_failure_count("INV-001") == 0
        finally:
            shutil.rmtree(tmp_dir)

    def test_reset_noop_for_missing(self):
        """Reset on a non-existent invoice should not raise."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            dlq.reset("INV-DOESNT-EXIST")  # should not raise
        finally:
            shutil.rmtree(tmp_dir)

    def test_persistence_across_instances(self):
        """DLQ state should survive creating a new instance (process restart)."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq1 = DeadLetterQueue(path)
            dlq1.increment("INV-001", error="err 1")
            dlq1.increment("INV-001", error="err 2")

            # Simulate process restart — create a new instance from the same file
            dlq2 = DeadLetterQueue(path)
            assert dlq2.get_failure_count("INV-001") == 2
            assert dlq2.get("INV-001")["last_error"] == "err 2"
        finally:
            shutil.rmtree(tmp_dir)

    def test_get_all_returns_snapshot(self):
        """get_all should return all entries."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            dlq.increment("INV-001", error="err")
            dlq.increment("INV-002", error="err")
            all_entries = dlq.get_all()
            assert len(all_entries) == 2
            assert "INV-001" in all_entries
            assert "INV-002" in all_entries
        finally:
            shutil.rmtree(tmp_dir)

    def test_len(self):
        """len() should return the number of invoices in the DLQ."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            assert len(dlq) == 0
            dlq.increment("INV-001", error="err")
            dlq.increment("INV-002", error="err")
            assert len(dlq) == 2
            dlq.reset("INV-001")
            assert len(dlq) == 1
        finally:
            shutil.rmtree(tmp_dir)

    def test_file_is_valid_json(self):
        """The persisted dlq.json should be valid JSON after mutations."""
        path, tmp_dir = _make_temp_dlq()
        try:
            dlq = DeadLetterQueue(path)
            dlq.increment("INV-001", error="err 1")
            dlq.increment("INV-002", error="err 2")
            dlq.reset("INV-001")

            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            assert "INV-001" not in data
            assert "INV-002" in data
            assert data["INV-002"]["consecutive_failures"] == 1
        finally:
            shutil.rmtree(tmp_dir)


# ── Integration test: DLQ alert in agent audit log ────────────────────────────

def test_agent_emits_dlq_alert_after_threshold():
    """
    Simulate 3 consecutive LLM failures for an invoice (by pre-seeding the
    DLQ with 2 failures then running the agent with a broken LLM).
    Assert:
      - DLQ has consecutive_failures >= 3 for the target invoice.
      - Audit log contains a DLQ_ALERT entry.
    """
    tmp_csv = tempfile.mktemp(suffix=".csv")
    shutil.copy(config.DATA_PATH, tmp_csv)
    tmp_output = tempfile.mkdtemp(prefix="dlq_agent_test_")

    try:
        logger.reset()

        # Pre-seed the DLQ with 2 prior failures
        dlq_path = os.path.join(tmp_output, "dlq.json")
        dlq = DeadLetterQueue(dlq_path)
        dlq.increment("INV-1013", error="LLM failed run 1")
        dlq.increment("INV-1013", error="LLM failed run 2")
        assert dlq.get_failure_count("INV-1013") == 2

        # Mock LLM to fail with a Groq error for all invoices
        import groq
        mock_llm_instance = MagicMock()
        mock_llm_instance.invoke.side_effect = groq.AuthenticationError(
            message="Invalid API Key",
            response=MagicMock(status_code=401),
            body={"error": {"message": "Invalid API Key"}},
        )

        with (
            patch.object(config, "DRY_RUN", True),
            patch.object(config, "DATA_PATH", tmp_csv),
            patch.object(config, "OUTPUT_DIR", tmp_output),
            patch("src.tools._get_llm", return_value=mock_llm_instance),
        ):
            from src.agent import run_agent
            summary = run_agent(verbose=False)

        log = summary["log"]

        # ── Assert: DLQ file has count >= 3 for INV-1013 ──────────────
        dlq_reloaded = DeadLetterQueue(dlq_path)
        assert dlq_reloaded.get_failure_count("INV-1013") >= 3, (
            f"Expected consecutive_failures >= 3, got {dlq_reloaded.get_failure_count('INV-1013')}"
        )

        # ── Assert: audit log contains DLQ_ALERT for INV-1013 ─────────
        dlq_alerts = [
            e for e in log
            if e["invoice_no"] == "INV-1013"
            and e["result"] == "DLQ_ALERT"
        ]
        assert len(dlq_alerts) >= 1, (
            f"Expected at least 1 DLQ_ALERT for INV-1013, "
            f"found {len(dlq_alerts)}. Full log:\n"
            + json.dumps(log, indent=2)
        )

        # ── Assert: DLQ_ALERT reason mentions the failure count ───────
        assert "consecutive runs" in dlq_alerts[0]["reason"].lower() or "failed" in dlq_alerts[0]["reason"].lower(), (
            f"DLQ_ALERT reason doesn't mention failures: {dlq_alerts[0]['reason']}"
        )

        print(f"\n    PASS  DLQ count for INV-1013 = {dlq_reloaded.get_failure_count('INV-1013')}")
        print(f"    PASS  DLQ_ALERT audit entry found")
        print("\nTEST PASSED: DLQ tracks failures and emits alert at threshold.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


def test_agent_resets_dlq_on_success():
    """
    Verify that a successful send resets the DLQ counter for that invoice.
    Pre-seed the DLQ with 2 failures, then run with a working mock LLM.
    """
    tmp_csv = tempfile.mktemp(suffix=".csv")
    shutil.copy(config.DATA_PATH, tmp_csv)
    tmp_output = tempfile.mkdtemp(prefix="dlq_reset_test_")

    try:
        logger.reset()

        # Pre-seed the DLQ with 2 prior failures
        dlq_path = os.path.join(tmp_output, "dlq.json")
        dlq = DeadLetterQueue(dlq_path)
        dlq.increment("INV-1013", error="LLM failed run 1")
        dlq.increment("INV-1013", error="LLM failed run 2")
        assert dlq.get_failure_count("INV-1013") == 2

        # Mock LLM to succeed
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
            summary = run_agent(limit=None, verbose=False)

        # ── Assert: DLQ count for INV-1013 is now 0 (reset) ──────────
        dlq_reloaded = DeadLetterQueue(dlq_path)
        assert dlq_reloaded.get_failure_count("INV-1013") == 0, (
            f"Expected failure count = 0 after success, got {dlq_reloaded.get_failure_count('INV-1013')}"
        )
        assert "INV-1013" not in dlq_reloaded

        print(f"\n    PASS  DLQ count for INV-1013 reset to 0 after success")
        print("\nTEST PASSED: DLQ resets on successful send.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


# Allow running as a standalone script
if __name__ == "__main__":
    test_agent_emits_dlq_alert_after_threshold()
    test_agent_resets_dlq_on_success()
