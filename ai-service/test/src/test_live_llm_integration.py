import os
import pytest
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure ai-service root is in python path
ai_service_dir = Path(__file__).resolve().parent.parent.parent
if str(ai_service_dir) not in sys.path:
    sys.path.insert(0, str(ai_service_dir))

# Load environment variables from .env
env_file = ai_service_dir / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file, override=True)

from src.llm_client import LLMClient

@pytest.mark.anyio
async def test_live_groq_generation():
    """
    Strict Live Integration Test: Hits real Groq API and model configured in .env / os.environ.
    MUST NOT SKIP under any condition. Must fail if model or API key is invalid.
    """
    provider = os.environ.get("LLM_PROVIDER", "groq").strip()
    model = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile").strip()
    api_key = (
        os.environ.get("LLM_API_KEY") 
        or os.environ.get("GROQ_API_KEY") 
        or ""
    ).strip()

    assert api_key != "", "LLM_API_KEY must be set in .env or environment for live Groq verification."

    client = LLMClient()
    client.primary = {
        "model": f"{provider}/{model}",
        "api_key": api_key,
    }

    messages = ["Write a 1-sentence polite payment reminder for invoice INV-2001."]
    response = await client.generate(messages)

    assert response is not None, "Response from Groq must not be None"
    assert isinstance(response.content, str), "Response content must be a string"
    assert len(response.content.strip()) > 5, "Response content must not be empty"
    assert response.provider == provider, f"Provider must be '{provider}', got '{response.provider}'"
    safe_content = response.content.encode("ascii", "ignore").decode("ascii")
    print(f"\n[LIVE GROQ TEST PASSED] ({response.generation_ms:.1f}ms): {safe_content}")

@pytest.mark.anyio
async def test_live_groq_fallback_generation():
    """
    Strict Live Integration Test: Forces primary failure to verify secondary Groq account fallback.
    """
    fallback_provider = os.environ.get("LLM_FALLBACK_PROVIDER", "groq").strip()
    fallback_model = os.environ.get("LLM_FALLBACK_MODEL", "openai/gpt-oss-20b").strip()
    fallback_key = (
        os.environ.get("GROQ_FALLBACK_API_KEY") 
        or os.environ.get("LLM_FALLBACK_API_KEY") 
        or os.environ.get("GROQ_SECONDARY_API_KEY") 
        or ""
    ).strip()

    if not fallback_key or "your_secondary" in fallback_key or fallback_key.startswith("test-"):
        pytest.skip("Set GROQ_FALLBACK_API_KEY in .env to run live secondary Groq account fallback test.")

    client = LLMClient()
    client.primary = {
        "model": "groq/invalid-dummy-model",
        "api_key": "invalid-dummy-key-to-force-fallback",
    }
    client.fallback = {
        "model": f"{fallback_provider}/{fallback_model}",
        "api_key": fallback_key,
    }

    messages = ["Write a 1-sentence firm payment notice for invoice INV-3001."]
    response = await client.generate(messages)

    assert response is not None, "Fallback response must not be None"
    assert isinstance(response.content, str), "Fallback response content must be a string"
    assert len(response.content.strip()) > 5, "Fallback response content must not be empty"
    assert response.provider == fallback_provider, f"Fallback provider must be '{fallback_provider}', got '{response.provider}'"
    assert response.used_fallback is True, "Fallback flag must be True when primary fails"
    assert response.generation_ms > 0, "Generation duration must be positive"
    safe_content = response.content.encode("ascii", "ignore").decode("ascii")
    print(f"\n[LIVE GROQ SECONDARY FALLBACK TEST PASSED] ({response.generation_ms:.1f}ms): {safe_content}")

