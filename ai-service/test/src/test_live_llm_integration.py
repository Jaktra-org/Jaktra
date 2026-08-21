import os
import pytest
import sys

# Ensure ai-service root is in python path
ai_service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if ai_service_dir not in sys.path:
    sys.path.insert(0, ai_service_dir)

from src.llm_client import LLMClient

@pytest.mark.anyio
async def test_live_groq_generation():
    """
    Live Integration Test: Hits real Groq API key configured in environment.
    Skipped if no live key is present in environment.
    """
    live_groq_key = (
        os.environ.get("LLM_API_KEY") 
        or os.environ.get("GROQ_API_KEY") 
        or ""
    ).strip()

    if not live_groq_key or live_groq_key.startswith("test-") or "placeholder" in live_groq_key:
        pytest.skip("Skipping live Groq test: Real LLM_API_KEY is not configured in environment.")

    provider = os.environ.get("LLM_PROVIDER", "groq")
    model = os.environ.get("LLM_MODEL", "openai/gpt-oss-20b")

    client = LLMClient()
    client.primary = {
        "model": f"{provider}/{model}",
        "api_key": live_groq_key,
    }

    messages = ["Write a 1-sentence friendly reminder for invoice INV-2001."]
    response = await client.generate(messages)

    assert response is not None
    assert isinstance(response.content, str)
    assert len(response.content.strip()) > 5
    assert response.provider == provider
    assert response.used_fallback is False
    assert response.generation_ms > 0

@pytest.mark.anyio
async def test_live_gemini_fallback_generation():
    """
    Live Integration Test: Hits real Gemini API key configured in environment for fallback.
    Skipped if no live fallback key is present in environment.
    """
    live_gemini_key = (
        os.environ.get("LLM_FALLBACK_API_KEY") 
        or os.environ.get("Gemini_API_Key") 
        or os.environ.get("GEMINI_API_KEY")
        or ""
    ).strip()

    if not live_gemini_key or live_gemini_key.startswith("test-") or "placeholder" in live_gemini_key:
        pytest.skip("Skipping live Gemini test: Real Gemini_API_Key is not configured in environment.")

    fallback_provider = os.environ.get("LLM_FALLBACK_PROVIDER", "gemini")
    fallback_model = os.environ.get("LLM_FALLBACK_MODEL", "gemini-3.6-flash")

    client = LLMClient()
    # Force primary failure to test live fallback
    client.primary = {
        "model": "groq/invalid-dummy-model",
        "api_key": "invalid-dummy-key-to-force-fallback",
    }
    client.fallback = {
        "model": f"{fallback_provider}/{fallback_model}",
        "api_key": live_gemini_key,
    }

    messages = ["Write a 1-sentence firm payment notice for invoice INV-3001."]
    response = await client.generate(messages)

    assert response is not None
    assert isinstance(response.content, str)
    assert len(response.content.strip()) > 5
    assert response.provider == fallback_provider
    assert response.used_fallback is True
    assert response.generation_ms > 0
