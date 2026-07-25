import pytest
import asyncio
import re
from src.api.routes.generation import content_generator

@pytest.mark.anyio
async def test_concurrent_followup_generations(async_client, mock_litellm_completion):
    # Dynamic mock side_effect to generate output corresponding to the client name
    async def mock_acompletion(messages, **kwargs):
        # Extract client name from user message content
        user_msg = messages[-1]["content"]
        match = re.search(r"- Client: ([^\n]+)", user_msg)
        client_name = match.group(1).strip() if match else "Unknown"
        
        content = f"Subject: Overdue Notice: {client_name}\nBody:\nHello {client_name}, this is your custom invoice reminder."
        return mock_litellm_completion.create_response(content=content)
        
    mock_litellm_completion.side_effect = mock_acompletion
    
    headers = {"X-Service-Key": "test-service-key"}
    
    async def fire_request(i):
        payload = {
            "invoice_id": f"inv_{i}",
            "invoice_no": f"INV-{i}",
            "client_name": f"Client_{i}",
            "contact_email": f"billing{i}@client.com",
            "invoice_amount": "100.00",
            "currency": "USD",
            "due_date": "2026-07-20",
            "days_overdue": 5,
            "urgency_tier": "stage_1_warm",
            "channel": "email"
        }
        response = await async_client.post("/followup", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        # Assert that the output returned corresponds to the correct client name, ensuring isolation
        assert data["invoice_id"] == f"inv_{i}"
        assert data["content"]["subject"] == f"Overdue Notice: Client_{i}"
        assert f"Hello Client_{i}" in data["content"]["plain_body"]
        
    # Fire 10 requests concurrently
    tasks = [fire_request(i) for i in range(10)]
    await asyncio.gather(*tasks)

@pytest.mark.anyio
async def test_concurrent_risk_scoring(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    
    async def fire_risk_request(i):
        # We vary the amount so the score calculated differs
        # rule-based: overdue (5/60*0.4=0.033) + amount (i*1000/100000*0.2=0.002*i) + followup (0)
        # expected score = 0.033 + 0.002 * i
        payload = {
            "invoice_id": f"inv_{i}",
            "features": {
                "days_overdue": 5,
                "invoice_amount": float(i * 1000),
                "followup_count": 0
            }
        }
        # Force rule-based to guarantee deterministic values
        from src.api.routes.risk import scorer
        scorer._use_ml_model = False
        
        response = await async_client.post("/risk/score", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["invoice_id"] == f"inv_{i}"
        
        expected_score = round( (5/60.0)*0.4 + (i*1000.0/100000.0)*0.2, 3)
        assert data["risk_score"] == expected_score
        
    tasks = [fire_risk_request(i) for i in range(10)]
    await asyncio.gather(*tasks)
