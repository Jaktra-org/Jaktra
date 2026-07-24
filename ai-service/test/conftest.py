import os
import pytest
from unittest.mock import AsyncMock, MagicMock

# 1. Force environment variables for testing before importing anything
os.environ["ENVIRONMENT"] = "development"
os.environ["SERVICE_KEY"] = "test-service-key"
os.environ["LLM_API_KEY"] = "test-llm-api-key"
os.environ["LLM_PROVIDER"] = "groq"
os.environ["LLM_MODEL"] = "llama-3.1-8b-instant"

# Also fallback configs (optional but good to have)
os.environ["LLM_FALLBACK_PROVIDER"] = "groq"
os.environ["LLM_FALLBACK_MODEL"] = "llama-3.1-8b-instant-fallback"
os.environ["LLM_FALLBACK_API_KEY"] = "test-fallback-key"

from src.api.main import app
from src.api.config import settings

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture
def mock_litellm_completion():
    """
    Fixture to mock litellm.acompletion call.
    Returns a mock object that can be configured by individual tests.
    """
    mock = AsyncMock()
    
    # Default success response maker
    def _create_response(content: str, model: str = "llama-3.1-8b-instant", prompt_tokens: int = 10, completion_tokens: int = 20):
        resp = MagicMock()
        resp.model = model
        
        choice = MagicMock()
        choice.message.content = content
        resp.choices = [choice]
        
        usage = MagicMock()
        usage.prompt_tokens = prompt_tokens
        usage.completion_tokens = completion_tokens
        resp.usage = usage
        
        return resp
        
    mock.create_response = _create_response
    
    import litellm
    original_acompletion = litellm.acompletion
    litellm.acompletion = mock
    yield mock
    litellm.acompletion = original_acompletion

@pytest.fixture
async def async_client():
    from httpx import AsyncClient, ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
