import pytest
from src.api.routes.health import stats

@pytest.mark.anyio
async def test_health_endpoint(async_client):
    # Public endpoint, should not require auth
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    assert data["model"] == "llama-3.1-8b-instant"
    assert data["provider"] == "groq"
    assert isinstance(data["uptime_seconds"], int)

@pytest.mark.anyio
async def test_status_endpoint_auth_required(async_client):
    # Without key, status endpoint returns 401
    response = await async_client.get("/status")
    assert response.status_code == 401

@pytest.mark.anyio
async def test_status_endpoint_happy_path(async_client):
    # With key, status endpoint returns stats
    # Let's seed stats first to verify they are returned correctly
    stats["requests_served"] = 5
    stats["total_generation_ms"] = 5000
    stats["errors_last_hour"] = 2
    stats["is_processing"] = True
    
    headers = {"X-Service-Key": "test-service-key"}
    response = await async_client.get("/status", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_processing"] is True
    assert data["requests_served"] == 5
    assert data["avg_generation_ms"] == 1000  # 5000 // 5
    assert data["errors_last_hour"] == 2
