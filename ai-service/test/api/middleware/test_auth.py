import pytest
from unittest.mock import patch
from src.api.config import settings
from src.security import rate_limiter

@pytest.mark.anyio
async def test_docs_gating_development(async_client):
    # In development environment, /docs should not return 404 (it might redirect or return html)
    # The middleware returns 404 only if ENVIRONMENT != "development"
    settings.ENVIRONMENT = "development"
    response = await async_client.get("/docs")
    assert response.status_code != 404

@pytest.mark.anyio
async def test_docs_gating_production(async_client):
    # In production environment, /docs, /redoc, /openapi.json should return 404
    original_env = settings.ENVIRONMENT
    try:
        settings.ENVIRONMENT = "production"
        for path in ["/docs", "/redoc", "/openapi.json"]:
            response = await async_client.get(path)
            assert response.status_code == 404
            assert response.text == "Not Found"
    finally:
        settings.ENVIRONMENT = original_env

@pytest.mark.anyio
async def test_auth_no_credential(async_client):
    # Gated route (/status) without header should return 401
    response = await async_client.get("/status")
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid service key"}

@pytest.mark.anyio
async def test_auth_wrong_credential(async_client):
    # Gated route with incorrect service key should return 401
    headers = {"X-Service-Key": "wrong-key"}
    response = await async_client.get("/status", headers=headers)
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid service key"}

@pytest.mark.anyio
async def test_auth_correct_credential(async_client):
    # Gated route with correct service key should return 200
    headers = {"X-Service-Key": "test-service-key"}
    response = await async_client.get("/status", headers=headers)
    assert response.status_code == 200

@pytest.mark.anyio
async def test_auth_missing_server_key(async_client):
    # If settings.SERVICE_KEY is empty, server config error (500)
    original_key = settings.SERVICE_KEY
    try:
        settings.SERVICE_KEY = ""
        headers = {"X-Service-Key": "test-service-key"}
        response = await async_client.get("/status", headers=headers)
        assert response.status_code == 500
        assert response.json() == {"detail": "Server configuration error"}
    finally:
        settings.SERVICE_KEY = original_key

@pytest.mark.anyio
async def test_rate_limiting_triggered(async_client):
    # Mock is_rate_limited to return True
    with patch.object(rate_limiter, "is_rate_limited", return_value=True):
        headers = {"X-Service-Key": "test-service-key"}
        response = await async_client.get("/status", headers=headers)
        assert response.status_code == 429
        assert response.json() == {"detail": "Too Many Requests"}

@pytest.mark.anyio
async def test_request_id_header(async_client):
    # Verify X-Request-ID is generated and returned
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    
    # Verify custom X-Request-ID is preserved
    custom_id = "my-custom-request-id-12345"
    response = await async_client.get("/health", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == custom_id
