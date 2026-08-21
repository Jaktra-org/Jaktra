import os
import pytest
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from ai-service root directory if available
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=False)

# Force test authentication key for API route unit tests
os.environ["ENVIRONMENT"] = "development"
os.environ["SERVICE_KEY"] = "test-service-key"

from src.api.main import app
from src.api.config import settings

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture
def mock_litellm_completion():
    """
    Fixture to mock litellm.acompletion call for unit tests.
    Returns a mock object that can be configured by individual unit tests.
    """
    from unittest.mock import AsyncMock, MagicMock
    mock = AsyncMock()
    
    def _create_response(content: str, model: str = "openai/gpt-oss-20b", prompt_tokens: int = 10, completion_tokens: int = 20):
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
