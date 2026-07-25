import pytest

@pytest.mark.anyio
async def test_negotiate_endpoint_not_implemented(async_client):
    headers = {"X-Service-Key": "test-service-key"}
    payload = {
        "invoice_id": "inv_99",
        "invoice_data": {"amount": 1000},
        "client_proposal": "Can we pay in installments?",
        "company_policies": {"min_upfront_pct": 30}
    }
    
    response = await async_client.post("/agents/negotiate", json=payload, headers=headers)
    assert response.status_code == 501
    
    data = response.json()
    assert data["detail"]["error"] == "NOT_IMPLEMENTED"
    # Verify that the schema of NegotiationResponse is returned in details
    schema = data["detail"]["schema"]
    assert "properties" in schema
    assert "counter_proposal" in schema["properties"]
    assert "recommended_action" in schema["properties"]
