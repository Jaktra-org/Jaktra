"""
test/test_scheduler_missed_run.py

Tests for the missed-run detection and last-run timestamp persistence
added to src/scheduler.py.
"""

import json
import os
from datetime import datetime, timedelta, timezone
from unittest import mock

import pytest

# We import the functions under test directly.
# The module-level constants (LAST_RUN_STATE_FILE, MISSED_RUN_THRESHOLD_HOURS)
# are patched per-test to use tmp_path for isolation.
from src.scheduler import (
    _load_last_run_timestamp,
    _save_last_run_timestamp,
    _check_missed_run,
    scheduled_job,
    MISSED_RUN_THRESHOLD_HOURS,
)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _write_state_file(path: str, timestamp: datetime) -> None:
    """Write a valid last_run.json state file at the given path."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"last_run_timestamp": timestamp.isoformat()}, f)


# ── Tests: _load_last_run_timestamp ──────────────────────────────────────────

class TestLoadLastRunTimestamp:
    def test_returns_none_when_file_missing(self, tmp_path):
        fake_path = str(tmp_path / "nonexistent.json")
        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", fake_path):
            assert _load_last_run_timestamp() is None

    def test_returns_none_on_corrupt_json(self, tmp_path):
        bad_file = tmp_path / "last_run.json"
        bad_file.write_text("NOT VALID JSON", encoding="utf-8")
        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", str(bad_file)):
            assert _load_last_run_timestamp() is None

    def test_reads_valid_timestamp(self, tmp_path):
        state_file = str(tmp_path / "last_run.json")
        ts = datetime(2026, 5, 20, 9, 0, 0, tzinfo=timezone.utc)
        _write_state_file(state_file, ts)

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file):
            result = _load_last_run_timestamp()

        assert result == ts


# ── Tests: _save_last_run_timestamp ──────────────────────────────────────────

class TestSaveLastRunTimestamp:
    def test_creates_file_with_valid_iso_timestamp(self, tmp_path):
        state_file = str(tmp_path / "last_run.json")
        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file):
            _save_last_run_timestamp()

        assert os.path.exists(state_file)
        with open(state_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        ts = datetime.fromisoformat(data["last_run_timestamp"])
        # Should be very recent (within the last 5 seconds)
        assert (datetime.now(tz=timezone.utc) - ts).total_seconds() < 5

    def test_overwrites_existing_file(self, tmp_path):
        state_file = str(tmp_path / "last_run.json")
        old_ts = datetime(2020, 1, 1, tzinfo=timezone.utc)
        _write_state_file(state_file, old_ts)

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file):
            _save_last_run_timestamp()

        with open(state_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        new_ts = datetime.fromisoformat(data["last_run_timestamp"])
        assert new_ts.year >= 2026  # definitely newer than 2020


# ── Tests: _check_missed_run ────────────────────────────────────────────────

class TestCheckMissedRun:
    def test_no_state_file_triggers_alert(self, tmp_path, capsys):
        """Missing last_run.json → MISSED_RUN_DETECTED logged + alert printed."""
        fake_path = str(tmp_path / "last_run.json")

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", fake_path), \
             mock.patch("src.scheduler.app_logger") as mock_logger:
            result = _check_missed_run()

        assert result is True
        # Verify structured log was written
        mock_logger.log_action.assert_called_once()
        call_kwargs = mock_logger.log_action.call_args
        assert call_kwargs[1]["action"] == "MISSED_RUN_DETECTED" or \
               call_kwargs[0][1] == "MISSED_RUN_DETECTED"

        # Verify operator alert was printed
        captured = capsys.readouterr()
        assert "MISSED RUN DETECTED" in captured.out
        assert "python main.py --now" in captured.out

    def test_stale_timestamp_triggers_alert(self, tmp_path, capsys):
        """Timestamp > 26h ago → alert fires."""
        state_file = str(tmp_path / "last_run.json")
        stale_ts = datetime.now(tz=timezone.utc) - timedelta(hours=30)
        _write_state_file(state_file, stale_ts)

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file), \
             mock.patch("src.scheduler.app_logger") as mock_logger:
            result = _check_missed_run()

        assert result is True
        mock_logger.log_action.assert_called_once()

        captured = capsys.readouterr()
        assert "MISSED RUN DETECTED" in captured.out
        assert "30.0" in captured.out  # gap hours should be ~30

    def test_recent_timestamp_no_alert(self, tmp_path, capsys):
        """Timestamp < 26h ago → no alert."""
        state_file = str(tmp_path / "last_run.json")
        recent_ts = datetime.now(tz=timezone.utc) - timedelta(hours=2)
        _write_state_file(state_file, recent_ts)

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file), \
             mock.patch("src.scheduler.app_logger") as mock_logger:
            result = _check_missed_run()

        assert result is False
        mock_logger.log_action.assert_not_called()

        captured = capsys.readouterr()
        assert "MISSED RUN DETECTED" not in captured.out

    def test_alert_includes_gap_details(self, tmp_path, capsys):
        """Alert message contains expected_time, actual_time, and gap_hours."""
        state_file = str(tmp_path / "last_run.json")
        old_ts = datetime.now(tz=timezone.utc) - timedelta(hours=48)
        _write_state_file(state_file, old_ts)

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file), \
             mock.patch("src.scheduler.app_logger") as mock_logger:
            _check_missed_run()

        # Check the structured log reason contains all three fields
        log_call = mock_logger.log_action.call_args
        reason = log_call[1].get("reason") or log_call[0][3]
        assert "Expected run at" in reason
        assert "actual startup at" in reason
        assert "gap=" in reason

        # Check the printed alert
        captured = capsys.readouterr()
        assert "Last successful run" in captured.out
        assert "Current time" in captured.out
        assert "Gap" in captured.out


# ── Tests: scheduled_job timestamp persistence ──────────────────────────────

class TestScheduledJobPersistence:
    def test_successful_job_saves_timestamp(self, tmp_path):
        """Successful scheduled_job() writes last_run.json."""
        state_file = str(tmp_path / "last_run.json")
        fake_summary = {"total_sent": 3}

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file), \
             mock.patch("src.scheduler.run_agent", return_value=fake_summary):
            scheduled_job()

        assert os.path.exists(state_file)
        with open(state_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        assert "last_run_timestamp" in data

    def test_failed_job_does_not_save(self, tmp_path):
        """Failed run_agent() → last_run.json not written."""
        state_file = str(tmp_path / "last_run.json")

        with mock.patch("src.scheduler.LAST_RUN_STATE_FILE", state_file), \
             mock.patch("src.scheduler.run_agent", side_effect=RuntimeError("boom")):
            scheduled_job()  # should not raise — exception is caught internally

        assert not os.path.exists(state_file)
