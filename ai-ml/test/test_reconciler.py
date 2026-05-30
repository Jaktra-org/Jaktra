"""
test/test_reconciler.py

Verify that the reconciler detects and corrects followup_count drift
by comparing the CSV against audit-log send counts.

Run with:  python -m pytest test/test_reconciler.py -v
"""

import json
import os
import shutil
import tempfile

import pandas as pd

from src import config, logger
from src.data_loader import load_invoices, save_invoices
from src.reconciler import reconcile_followup_counts, _count_successful_sends


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_temp_csv():
    tmp = tempfile.mktemp(suffix=".csv")
    shutil.copy(config.DATA_PATH, tmp)
    return tmp


def _make_temp_output_dir():
    return tempfile.mkdtemp(prefix="recon_test_")


def _write_fake_report(output_dir, sends: list[dict], suffix=""):
    """
    Write a minimal run_report containing the given send entries.

    Each entry in `sends` should be a dict with:
      invoice_no, result (e.g. "sent", "dry_run", "error")
    """
    report = {
        "total_processed": len(sends),
        "total_sent": sum(1 for s in sends if s["result"] in ("sent", "dry_run")),
        "total_skipped": 0,
        "total_errors": 0,
        "log": [
            {
                "timestamp": "2026-05-23T10:00:00+00:00",
                "invoice_no": s["invoice_no"],
                "action": "email_sent",
                "result": s["result"],
                "reason": f"to=test@example.com | status={s['result']}",
            }
            for s in sends
        ],
    }
    ts = f"20260523T100000Z{suffix}"
    path = os.path.join(output_dir, f"run_report_{ts}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    return path


# ── Unit tests ────────────────────────────────────────────────────────────────

class TestCountSuccessfulSends:

    def test_counts_sent_entries(self):
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, [
                {"invoice_no": "INV-001", "result": "sent"},
                {"invoice_no": "INV-001", "result": "sent"},
                {"invoice_no": "INV-002", "result": "sent"},
            ])
            counts = _count_successful_sends(tmp_dir)
            assert counts["INV-001"] == 2
            assert counts["INV-002"] == 1
        finally:
            shutil.rmtree(tmp_dir)

    def test_counts_dry_run_as_success(self):
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, [
                {"invoice_no": "INV-001", "result": "dry_run"},
            ])
            counts = _count_successful_sends(tmp_dir)
            assert counts["INV-001"] == 1
        finally:
            shutil.rmtree(tmp_dir)

    def test_ignores_failed_sends(self):
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, [
                {"invoice_no": "INV-001", "result": "error"},
                {"invoice_no": "INV-001", "result": "FAILED"},
            ])
            counts = _count_successful_sends(tmp_dir)
            assert counts.get("INV-001", 0) == 0
        finally:
            shutil.rmtree(tmp_dir)

    def test_counts_across_multiple_reports(self):
        tmp_dir = _make_temp_output_dir()
        try:
            _write_fake_report(tmp_dir, [
                {"invoice_no": "INV-001", "result": "sent"},
            ], suffix="_a")
            _write_fake_report(tmp_dir, [
                {"invoice_no": "INV-001", "result": "sent"},
            ], suffix="_b")
            counts = _count_successful_sends(tmp_dir)
            assert counts["INV-001"] == 2
        finally:
            shutil.rmtree(tmp_dir)

    def test_empty_dir(self):
        tmp_dir = _make_temp_output_dir()
        try:
            counts = _count_successful_sends(tmp_dir)
            assert counts == {}
        finally:
            shutil.rmtree(tmp_dir)


# ── Integration tests ─────────────────────────────────────────────────────────

def test_reconciler_corrects_inflated_count():
    """
    Artificially inflate followup_count for INV-1013 in the CSV,
    create audit logs showing fewer actual sends, run reconciler,
    and assert the CSV is corrected to match.
    """
    tmp_csv = _make_temp_csv()
    tmp_output = _make_temp_output_dir()

    try:
        # Read the CSV and inflate followup_count for INV-1013
        df = load_invoices(tmp_csv)
        mask = df["invoice_no"] == "INV-1013"
        original_count = int(df.loc[mask, "followup_count"].iloc[0])
        inflated_count = original_count + 5  # artificially inflate by 5
        df.loc[mask, "followup_count"] = inflated_count
        save_invoices(df, tmp_csv)

        # Verify inflation took effect
        df_check = load_invoices(tmp_csv)
        assert int(df_check.loc[df_check["invoice_no"] == "INV-1013", "followup_count"].iloc[0]) == inflated_count

        # Create audit logs with the original number of successful sends
        sends = [{"invoice_no": "INV-1013", "result": "sent"} for _ in range(original_count)]
        _write_fake_report(tmp_output, sends)

        # Run the reconciler
        result = reconcile_followup_counts(tmp_csv, tmp_output)

        # Assert mismatches were detected and corrected
        assert result["mismatches_found"] >= 1, (
            f"Expected at least 1 mismatch, got {result['mismatches_found']}"
        )

        inv_correction = next(
            (c for c in result["corrections"] if c["invoice_no"] == "INV-1013"),
            None,
        )
        assert inv_correction is not None, "No correction found for INV-1013"
        assert inv_correction["csv_count"] == inflated_count
        assert inv_correction["audit_count"] == original_count

        # Verify the CSV was actually corrected
        df_after = load_invoices(tmp_csv)
        corrected_count = int(df_after.loc[df_after["invoice_no"] == "INV-1013", "followup_count"].iloc[0])
        assert corrected_count == original_count, (
            f"Expected followup_count={original_count}, got {corrected_count}"
        )

        print(f"\n    PASS  Inflated count {inflated_count} corrected to {original_count}")
        print(f"    PASS  {result['mismatches_found']} mismatch(es) detected and corrected")
        print("\nTEST PASSED: Reconciler corrects inflated followup_count.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


def test_reconciler_no_correction_when_matching():
    """
    When followup_count matches audit log counts, no corrections are made.
    """
    tmp_csv = _make_temp_csv()
    tmp_output = _make_temp_output_dir()

    try:
        df = load_invoices(tmp_csv)

        # Create audit logs that exactly match every invoice's followup_count
        sends = []
        for _, row in df.iterrows():
            count = int(row["followup_count"])
            for _ in range(count):
                sends.append({"invoice_no": row["invoice_no"], "result": "sent"})

        if sends:
            _write_fake_report(tmp_output, sends)

        result = reconcile_followup_counts(tmp_csv, tmp_output)

        assert result["mismatches_found"] == 0, (
            f"Expected 0 mismatches but got {result['mismatches_found']}: "
            f"{result['corrections']}"
        )

        print(f"\n    PASS  {result['total_checked']} invoices checked, 0 mismatches")
        print("\nTEST PASSED: No corrections when counts match.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


def test_reconciler_corrects_deflated_count():
    """
    Set followup_count to 0 for an invoice that has audit-log sends.
    Reconciler should bump it up.
    """
    tmp_csv = _make_temp_csv()
    tmp_output = _make_temp_output_dir()

    try:
        # Zero out followup_count for INV-1013
        df = load_invoices(tmp_csv)
        mask = df["invoice_no"] == "INV-1013"
        df.loc[mask, "followup_count"] = 0
        save_invoices(df, tmp_csv)

        # Create audit logs showing 3 successful sends
        _write_fake_report(tmp_output, [
            {"invoice_no": "INV-1013", "result": "sent"},
            {"invoice_no": "INV-1013", "result": "sent"},
            {"invoice_no": "INV-1013", "result": "dry_run"},
        ])

        result = reconcile_followup_counts(tmp_csv, tmp_output)

        inv_correction = next(
            (c for c in result["corrections"] if c["invoice_no"] == "INV-1013"),
            None,
        )
        assert inv_correction is not None
        assert inv_correction["csv_count"] == 0
        assert inv_correction["audit_count"] == 3

        # Verify CSV was corrected
        df_after = load_invoices(tmp_csv)
        corrected = int(df_after.loc[df_after["invoice_no"] == "INV-1013", "followup_count"].iloc[0])
        assert corrected == 3

        print(f"\n    PASS  Deflated count 0 corrected to 3")
        print("\nTEST PASSED: Reconciler corrects deflated followup_count.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


def test_agent_logs_reconciliation_summary():
    """
    Run the agent and verify the audit log contains a reconcile_summary entry.
    """
    from unittest.mock import patch, MagicMock

    tmp_csv = _make_temp_csv()
    tmp_output = _make_temp_output_dir()

    try:
        logger.reset()

        canned = (
            "Subject: Payment Reminder\n\n"
            "Body:\nDear Client,\n\nPlease pay your invoice.\n\n"
            "Best regards,\nFinance Department"
        )
        mock_llm_response = MagicMock()
        mock_llm_response.content = canned
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

        recon_entries = [
            e for e in log
            if e["action"] == "reconcile_summary"
        ]
        assert len(recon_entries) >= 1, (
            f"Expected reconcile_summary entry in log, found none.\n"
            + json.dumps(log, indent=2)
        )
        assert "reconciled" in recon_entries[0]["reason"].lower()
        assert "mismatches" in recon_entries[0]["reason"].lower()

        print(f"\n    PASS  reconcile_summary found: {recon_entries[0]['reason']}")
        print("\nTEST PASSED: Agent logs reconciliation summary.\n")

    finally:
        if os.path.exists(tmp_csv):
            os.unlink(tmp_csv)
        shutil.rmtree(tmp_output, ignore_errors=True)


if __name__ == "__main__":
    test_reconciler_corrects_inflated_count()
    test_reconciler_no_correction_when_matching()
    test_reconciler_corrects_deflated_count()
    test_agent_logs_reconciliation_summary()
