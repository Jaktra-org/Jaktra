import pytest
from unittest.mock import AsyncMock, patch
from src.api.routes.generation import FollowupRequest
from src.api.services.content_generator import ContentGenerator
from src.prompt_registry import registry
from src.llm_client import LLMClient
from src.security import validate_email_output
from src.exceptions import OutputValidationError


@pytest.mark.anyio
async def test_email_scenario_warm_individual_with_portal_link(mock_litellm_completion):
    """Test warm tone email for an individual with invoice description and portal link."""
    expected_link = "https://app.jaktra.com/i/test-token-123"
    llm_output = (
        "Subject: Friendly Reminder: Payment for Web Application Development Services - Invoice #INV-101\n\n"
        "Body:\n"
        "Dear Dr. Suresh,\n\n"
        "I hope this email finds you well. This is a gentle reminder regarding invoice #INV-101 for Web Application Development Services, in the amount of ₹25,000.00, which was due on 2026-08-20.\n\n"
        f"You can quickly review the invoice and complete your payment online using our secure portal: {expected_link}\n\n"
        "If you have already processed this payment, please disregard this note. If you have any questions or need assistance, feel free to reach out.\n\n"
        "Warm regards,\n"
        "Finance Department"
    )
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_output)

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_001",
        invoice_no="INV-101",
        client_name="Dr. Suresh",
        company_name=None,
        invoice_amount="25000.00",
        currency="INR",
        due_date="2026-08-20",
        days_overdue=5,
        urgency_tier="stage_1_warm",
        channel="email",
        payment_link=expected_link,
        invoice_subject="Web Application Development Services",
        sender_name="Finance Department",
    )

    result = await generator.generate(req)
    assert result.subject == "Friendly Reminder: Payment for Web Application Development Services - Invoice #INV-101"
    assert "Dr. Suresh" in result.plain_body
    assert expected_link in result.plain_body
    assert "INV-101" in result.plain_body
    assert "<html" in result.html_body
    assert expected_link in result.html_body


@pytest.mark.anyio
async def test_email_scenario_firm_company_recipient(mock_litellm_completion):
    """Test firm second-notice email for a company recipient."""
    expected_link = "https://app.jaktra.com/i/firm-token-456"
    llm_output = (
        "Subject: Second Notice: Payment Due for Cloud Infrastructure Hosting - Invoice #INV-202\n\n"
        "Body:\n"
        "Dear Acme Corp Accounts Payable Team,\n\n"
        "We are writing to follow up on our previous notice regarding invoice #INV-202 for Cloud Infrastructure Hosting, in the amount of $4,500.00, which was due on 2026-08-10 (12 days overdue).\n\n"
        f"Please arrange for immediate settlement via our secure payment portal: {expected_link}\n\n"
        "If payment is already scheduled, please reply with the remittance date so we may update your account records accordingly.\n\n"
        "Best regards,\n"
        "Accounts Receivable Team"
    )
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_output)

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_002",
        invoice_no="INV-202",
        client_name="Acme Corp",
        company_name="Acme Corp",
        invoice_amount="4500.00",
        currency="USD",
        due_date="2026-08-10",
        days_overdue=12,
        urgency_tier="stage_2_firm",
        channel="email",
        payment_link=expected_link,
        invoice_subject="Cloud Infrastructure Hosting",
        sender_name="Accounts Receivable Team",
    )

    result = await generator.generate(req)
    assert "Acme Corp" in result.plain_body
    assert expected_link in result.plain_body
    assert "INV-202" in result.plain_body


@pytest.mark.anyio
async def test_email_scenario_serious_escalation(mock_litellm_completion):
    """Test serious escalation notice with 48h deadline."""
    expected_link = "https://app.jaktra.com/i/serious-token-789"
    llm_output = (
        "Subject: URGENT: Escalation Notice for Unsettled Invoice #INV-303 - Apex Solutions\n\n"
        "Body:\n"
        "Dear Jane Doe and the Apex Solutions Finance Team,\n\n"
        "This is a formal escalation notice regarding overdue invoice #INV-303 for Enterprise Software Licensing ($12,000.00), which is now 18 days overdue.\n\n"
        f"Please remit payment immediately using the secure link below or reply within 48 hours to avoid formal escalation: {expected_link}\n\n"
        "We value our business relationship and urge you to contact us immediately to resolve this outstanding matter.\n\n"
        "Sincerely,\n"
        "Finance Operations"
    )
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_output)

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_003",
        invoice_no="INV-303",
        client_name="Jane Doe",
        company_name="Apex Solutions",
        invoice_amount="12000.00",
        currency="USD",
        due_date="2026-08-05",
        days_overdue=18,
        urgency_tier="stage_3_serious",
        channel="email",
        payment_link=expected_link,
        invoice_subject="Enterprise Software Licensing",
        sender_name="Finance Operations",
    )

    result = await generator.generate(req)
    assert "Jane Doe" in result.plain_body
    assert "Apex Solutions" in result.plain_body
    assert expected_link in result.plain_body


@pytest.mark.anyio
async def test_email_scenario_stern_final_notice(mock_litellm_completion):
    """Test stern final warning notice."""
    expected_link = "https://app.jaktra.com/i/final-token-999"
    llm_output = (
        "Subject: FINAL DEMAND NOTICE: Immediate Settlement Required for Invoice #INV-404\n\n"
        "Body:\n"
        "Dear Global Logistics Finance Team,\n\n"
        "This is our FINAL NOTICE regarding unpaid invoice #INV-404 for Freight Management Services in the amount of $8,750.00, which is now 28 days overdue.\n\n"
        f"You must complete payment within 5 business days using our secure portal: {expected_link}\n\n"
        "Failure to settle this balance will result in immediate referral of this account to a third-party collection agency and potential legal proceedings to recover the debt plus interest and legal costs.\n\n"
        "Accounts Receivable Department"
    )
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_output)

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_004",
        invoice_no="INV-404",
        client_name="Global Logistics",
        company_name="Global Logistics",
        invoice_amount="8750.00",
        currency="USD",
        due_date="2026-07-25",
        days_overdue=28,
        urgency_tier="stage_4_stern",
        channel="email",
        payment_link=expected_link,
        invoice_subject="Freight Management Services",
        sender_name="Accounts Receivable Department",
    )

    result = await generator.generate(req)
    assert expected_link in result.plain_body
    assert "INV-404" in result.plain_body


@pytest.mark.anyio
async def test_email_scenario_installment_payment_plan(mock_litellm_completion):
    """Test installment payment reminder."""
    expected_link = "https://app.jaktra.com/i/plan-token-555"
    llm_output = (
        "Subject: Payment Plan Reminder: Installment #2 of 4 for Invoice #INV-505\n\n"
        "Body:\n"
        "Dear Dr. Suresh,\n\n"
        "We appreciate your continued commitment to your agreed payment plan for invoice #INV-505 (Consulting Retainer). This is a reminder that Installment #2 of 4 in the amount of ₹15,000.00 is due on 2026-08-30.\n\n"
        f"You can easily make this installment payment online at: {expected_link}\n\n"
        "Thank you for your prompt attention to maintaining your payment plan schedule.\n\n"
        "Warm regards,\n"
        "Finance Department"
    )
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_output)

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_005",
        invoice_no="INV-505",
        client_name="Dr. Suresh",
        invoice_amount="15000.00",
        currency="INR",
        due_date="2026-08-30",
        days_overdue=0,
        urgency_tier="stage_1_warm",
        channel="email",
        payment_link=expected_link,
        invoice_subject="Consulting Retainer",
        installment_number=2,
        total_installments=4,
        sender_name="Finance Department",
    )

    result = await generator.generate(req)
    assert "Installment #2 of 4" in result.subject or "Installment #2" in result.subject
    assert expected_link in result.plain_body
    assert "INV-505" in result.plain_body


@pytest.mark.anyio
async def test_email_targeted_retry_when_first_attempt_omits_link(mock_litellm_completion):
    """Verify that if first LLM draft omits payment link, targeted retry corrects it."""
    expected_link = "https://app.jaktra.com/i/retry-token-888"

    # First attempt: forgets payment link (will fail validation)
    bad_first_draft = (
        "Subject: Payment Reminder for Invoice #INV-606\n\n"
        "Body:\n"
        "Dear Dr. Suresh,\n\n"
        "This is a reminder that invoice #INV-606 for ₹10,000.00 is due. Please settle promptly.\n\n"
        "Regards,\nFinance Department"
    )
    # Second attempt (targeted retry): correctly includes payment link
    good_retry_draft = (
        "Subject: Payment Reminder for Invoice #INV-606\n\n"
        "Body:\n"
        "Dear Dr. Suresh,\n\n"
        f"This is a reminder that invoice #INV-606 for ₹10,000.00 is due. Please complete your payment online via our portal: {expected_link}\n\n"
        "Best regards,\nFinance Department"
    )

    mock_litellm_completion.side_effect = [
        mock_litellm_completion.create_response(content=bad_first_draft),
        mock_litellm_completion.create_response(content=good_retry_draft),
    ]

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_006",
        invoice_no="INV-606",
        client_name="Dr. Suresh",
        invoice_amount="10000.00",
        currency="INR",
        due_date="2026-08-22",
        days_overdue=3,
        urgency_tier="stage_1_warm",
        channel="email",
        payment_link=expected_link,
        sender_name="Finance Department",
    )

    result = await generator.generate(req)
    assert expected_link in result.plain_body
    assert mock_litellm_completion.call_count == 2


@pytest.mark.anyio
async def test_email_rich_structured_fallback_when_both_attempts_fail(mock_litellm_completion):
    """Verify rich fallback produces a complete, professional email when LLM fails."""
    expected_link = "https://app.jaktra.com/i/fallback-token-777"
    invalid_content = "Too short"
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=invalid_content)

    generator = ContentGenerator(prompt_registry=registry, llm_client=LLMClient())
    req = FollowupRequest(
        invoice_id="inv_007",
        invoice_no="INV-707",
        client_name="Jane Doe",
        company_name="Apex Global",
        invoice_amount="5000.0",
        currency="USD",
        due_date="2026-08-15",
        days_overdue=10,
        urgency_tier="stage_2_firm",
        channel="email",
        payment_link=expected_link,
        invoice_subject="Design System Consulting",
        sender_name="Finance Team",
    )

    result = await generator.generate(req)
    assert result.subject != ""
    assert "INV-707" in result.plain_body
    assert "Design System Consulting" in result.plain_body
    assert expected_link in result.plain_body
    assert "Finance Team" in result.plain_body
    assert len(result.plain_body) > 150
