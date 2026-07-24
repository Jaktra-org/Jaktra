import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from src.api.routes.generation import content_generator
from src.exceptions import LLMGenerationError, OutputValidationError, PromptInjectionDetectedError

@pytest.mark.anyio
async def test_generate_followup_email_happy_path(async_client, mock_litellm_completion):
    # Mock LLM to return valid email content
    llm_content = "Subject: Payment Reminder for Invoice 101\nBody:\nDear Client, this is a friendly reminder that payment for Invoice 101 is due. Please settle as soon as possible."
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_content)
    
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "email",
        "followup_count": 1,
        "payment_link": "https://trusted.jaktra.com/pay/123",
        "sender_name": "Finance Dept"
    }
    
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["invoice_id"] == "inv_123"
    assert data["channel"] == "email"
    assert data["content"]["subject"] == "Payment Reminder for Invoice 101"
    assert "Dear Client" in data["content"]["plain_body"]
    assert "<html" in data["content"]["html_body"]
    assert data["metadata"]["tier_used"] == "stage_1_warm"

@pytest.mark.anyio
async def test_generate_followup_sms_happy_path(async_client, mock_litellm_completion):
    llm_content = "Payment of $1500.00 for INV-101 is now overdue. Please pay at: https://trusted.jaktra.com/pay/123."
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_content)
    
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "sms",
        "payment_link": "https://trusted.jaktra.com/pay/123"
    }
    
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["channel"] == "sms"
    assert data["content"]["subject"] == ""
    assert data["content"]["plain_body"] == llm_content

@pytest.mark.anyio
async def test_generate_followup_whatsapp_happy_path(async_client, mock_litellm_completion):
    llm_content = "Hello Acme Corp. This is a WhatsApp reminder that invoice INV-101 for $1500.00 is overdue. Pay at: https://trusted.jaktra.com/pay/123"
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_content)
    
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "whatsapp",
        "payment_link": "https://trusted.jaktra.com/pay/123"
    }
    
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["channel"] == "whatsapp"
    assert data["content"]["plain_body"] == llm_content

@pytest.mark.anyio
async def test_generate_followup_validation_error_unsupported_tier(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 45,
        "urgency_tier": "legal_escalation",  # non-automated
        "channel": "email"
    }
    
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 400
    assert response.json() == {"detail": "TIER_NOT_AUTOMATABLE"}

@pytest.mark.anyio
async def test_generate_followup_validation_error_invalid_channel(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "invalid_channel"  # Invalid channel
    }
    # Should fail FastAPI input model validation
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_generate_followup_pydantic_boundary_fields(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    # days_overdue < 0
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": -1,
        "urgency_tier": "stage_1_warm",
        "channel": "email"
    }
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 422

    # days_overdue > 3650
    payload["days_overdue"] = 3651
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 422

    # followup_count > 100
    payload["days_overdue"] = 5
    payload["followup_count"] = 101
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_generate_followup_output_validation_failure(async_client, mock_litellm_completion):
    # Missing subject line in LLM content
    llm_content = "This is a message with no subject line."
    mock_litellm_completion.return_value = mock_litellm_completion.create_response(content=llm_content)
    
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "email"
    }
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 422
    assert response.json() == {"detail": "GENERATION_VALIDATION_FAILED"}

@pytest.mark.anyio
async def test_generate_followup_upstream_llm_failure(async_client, mock_litellm_completion):
    # Simulate litellm exception mapping to LLMGenerationError
    mock_litellm_completion.side_effect = LLMGenerationError("Upstream failure")
    
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "email"
    }
    response = await async_client.post("/followup", json=payload, headers=headers)
    assert response.status_code == 502
    assert response.json() == {
        "detail": {"error": "Failed to generate communication content due to an upstream LLM error.", "retryable": True}
    }

@pytest.mark.anyio
async def test_generate_followup_unknown_error(async_client):
    # Simulate completely unexpected exception
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_123",
        "invoice_no": "INV-101",
        "client_name": "Acme Corp",
        "contact_email": "billing@acme.com",
        "invoice_amount": "1500.00",
        "currency": "USD",
        "due_date": "2026-07-20",
        "days_overdue": 5,
        "urgency_tier": "stage_1_warm",
        "channel": "email"
    }
    with patch.object(content_generator, "generate", side_effect=RuntimeError("Something crashed")):
        response = await async_client.post("/followup", json=payload, headers=headers)
        assert response.status_code == 500
        assert response.json() == {"detail": "Internal server error"}


# --- Batch Generation Tests ---

@pytest.mark.anyio
async def test_batch_followup_limit_exceeded(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    invoices = []
    for i in range(51):
        invoices.append({
            "invoice_id": f"inv_{i}",
            "invoice_no": f"INV-{i}",
            "client_name": "Client",
            "contact_email": "client@billing.com",
            "invoice_amount": "100.0",
            "currency": "USD",
            "due_date": "2026-07-20",
            "days_overdue": 5,
            "urgency_tier": "stage_1_warm"
        })
    payload = {"invoices": invoices, "concurrency": 3}
    response = await async_client.post("/followup/batch", json=payload, headers=headers)
    assert response.status_code == 400
    assert response.json() == {"detail": "BATCH_SIZE_EXCEEDED"}

@pytest.mark.anyio
async def test_batch_followup_invalid_concurrency(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoices": [{
            "invoice_id": "inv_1",
            "invoice_no": "INV-1",
            "client_name": "Client",
            "contact_email": "client@billing.com",
            "invoice_amount": "100.0",
            "currency": "USD",
            "due_date": "2026-07-20",
            "days_overdue": 5,
            "urgency_tier": "stage_1_warm"
        }],
        "concurrency": 0  # Invalid, must be 1-10
    }
    response = await async_client.post("/followup/batch", json=payload, headers=headers)
    assert response.status_code == 422

@pytest.mark.anyio
async def test_batch_followup_individual_failures(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    
    # We will mock content_generator.generate to raise various exceptions depending on invoice_id
    from src.api.services.content_generator import GenerationResult
    
    async def mock_generate(req):
        if req.invoice_id == "success":
            return GenerationResult(
                subject="Subject line",
                plain_body="This is body text for success.",
                metadata={"tier_used": req.urgency_tier, "model": "llama", "generation_ms": 10.0, "token_count": 50}
            )
        elif req.invoice_id == "timeout":
            await asyncio.sleep(0.5) # Will trigger timeout if we set timeout low or mock it
            # To test TimeoutError, we can just raise asyncio.TimeoutError
            raise asyncio.TimeoutError()
        elif req.invoice_id == "tier_not_automatable":
            raise ValueError("legal_escalation does not have an automated prompt")
        elif req.invoice_id == "value_error":
            raise ValueError("Some standard value error")
        elif req.invoice_id == "validation_error":
            raise OutputValidationError("validation failed")
        elif req.invoice_id == "llm_error":
            raise LLMGenerationError("upstream failed")
        elif req.invoice_id == "unexpected":
            raise Exception("unexpected database error")
            
    invoices = [
        {"invoice_id": "success", "invoice_no": "INV-1", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "stage_1_warm"},
        {"invoice_id": "timeout", "invoice_no": "INV-2", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "stage_1_warm"},
        {"invoice_id": "tier_not_automatable", "invoice_no": "INV-3", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "legal_escalation"},
        {"invoice_id": "value_error", "invoice_no": "INV-4", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "stage_1_warm"},
        {"invoice_id": "validation_error", "invoice_no": "INV-5", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "stage_1_warm"},
        {"invoice_id": "llm_error", "invoice_no": "INV-6", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "stage_1_warm"},
        {"invoice_id": "unexpected", "invoice_no": "INV-7", "client_name": "Client", "contact_email": "client@billing.com", "invoice_amount": "100.0", "currency": "USD", "due_date": "2026-07-20", "days_overdue": 5, "urgency_tier": "stage_1_warm"},
    ]
    
    with patch.object(content_generator, "generate", side_effect=mock_generate):
        payload = {"invoices": invoices, "concurrency": 2}
        response = await async_client.post("/followup/batch", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        results = {r["invoice_id"]: r for r in data["results"]}
        assert results["success"]["status"] == "success"
        assert results["success"]["content"]["subject"] == "Subject line"
        
        assert results["timeout"]["status"] == "error"
        assert results["timeout"]["error"] == "TIMEOUT"
        assert results["timeout"]["retryable"] is True
        
        assert results["tier_not_automatable"]["status"] == "error"
        assert results["tier_not_automatable"]["error"] == "TIER_NOT_AUTOMATABLE"
        assert results["tier_not_automatable"]["retryable"] is False
        
        assert results["value_error"]["status"] == "error"
        assert "Some standard value error" in results["value_error"]["error"]
        assert results["value_error"]["retryable"] is False
        
        assert results["validation_error"]["status"] == "error"
        assert results["validation_error"]["error"] == "GENERATION_VALIDATION_FAILED"
        assert results["validation_error"]["retryable"] is False
        
        assert results["llm_error"]["status"] == "error"
        assert "LLM generation failed" in results["llm_error"]["error"]
        assert results["llm_error"]["retryable"] is True
        
        assert results["unexpected"]["status"] == "error"
        assert "Internal processing failed" in results["unexpected"]["error"]
        assert results["unexpected"]["retryable"] is False

        # Summary check
        summary = data["summary"]
        assert summary["total"] == 7
        assert summary["succeeded"] == 1
        assert summary["failed"] == 6
        assert isinstance(summary["total_ms"], float)
