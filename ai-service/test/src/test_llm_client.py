import pytest
import asyncio
import litellm
from unittest.mock import AsyncMock, MagicMock, patch
from src.llm_client import LLMClient
from src.exceptions import LLMGenerationError

@pytest.mark.anyio
async def test_llm_client_message_formatting(mock_litellm_completion):
    # Setup mock response
    mock_resp = mock_litellm_completion.create_response(content="Hello there")
    mock_litellm_completion.return_value = mock_resp
    
    client = LLMClient()
    
    # Message objects with type attribute
    system_msg = MagicMock()
    system_msg.type = "system"
    system_msg.content = "System instruction"
    
    user_msg = MagicMock()
    user_msg.type = "human"
    user_msg.content = "User message"
    
    # Plain strings
    plain_msg = "Plain string message"
    
    messages = [system_msg, user_msg, plain_msg]
    
    response = await client.generate(messages)
    assert response.content == "Hello there"
    assert response.used_fallback is False
    
    # Verify messages passed to litellm
    called_messages = mock_litellm_completion.call_args[1]["messages"]
    assert len(called_messages) == 3
    assert called_messages[0] == {"role": "system", "content": "System instruction"}
    assert called_messages[1] == {"role": "user", "content": "User message"}
    assert called_messages[2] == {"role": "user", "content": "Plain string message"}

@pytest.mark.anyio
async def test_llm_client_fallback_success(mock_litellm_completion):
    client = LLMClient()
    # Configure fallback so it's present
    client.fallback = {
        "model": "groq/llama-fallback",
        "api_key": "test-fallback-key"
    }
    
    # Primary fails with a non-retryable exception or exhausts retries, fallback succeeds
    # side_effect can be a list: first element is raised on first call, second returned on second call
    primary_err = RuntimeError("Primary API offline")
    success_resp = mock_litellm_completion.create_response(content="Fallback response", model="llama-fallback")
    
    mock_litellm_completion.side_effect = [primary_err, success_resp]
    
    response = await client.generate(["Hello"])
    assert response.content == "Fallback response"
    assert response.used_fallback is True
    assert response.model == "llama-fallback"
    assert response.provider == "groq"

@pytest.mark.anyio
async def test_llm_client_bad_request_mapping(mock_litellm_completion):
    client = LLMClient()
    
    # Raise litellm.exceptions.BadRequestError
    # BadRequestError requires status_code, message
    bad_req_err = litellm.exceptions.BadRequestError(
        message="Invalid parameters", 
        model="llama", 
        response=None,
        llm_provider="groq"
    )
    mock_litellm_completion.side_effect = bad_req_err
    
    with pytest.raises(LLMGenerationError) as exc_info:
        await client.generate(["Hello"])
    assert "LLM provider error occurred" in str(exc_info.value)

@pytest.mark.anyio
async def test_llm_client_tenacity_retries(mock_litellm_completion):
    client = LLMClient()
    
    # Mock rate limit error (which is retryable)
    rate_limit_err = litellm.exceptions.RateLimitError(
        message="Rate limit reached",
        model="llama",
        response=None,
        llm_provider="groq"
    )
    success_resp = mock_litellm_completion.create_response(content="Successful after retry")
    
    # Fail twice, succeed on third
    mock_litellm_completion.side_effect = [rate_limit_err, rate_limit_err, success_resp]
    
    # Patch asyncio.sleep to make the test run instantly without waiting min 2s
    with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        response = await client.generate(["Hello"])
        assert response.content == "Successful after retry"
        assert response.used_fallback is False
        assert mock_sleep.call_count == 2
