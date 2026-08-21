import os
import time
import asyncio
import litellm
from dataclasses import dataclass
from src.exceptions import LLMGenerationError
from src.api.config import settings
from src.api.logging import logger

@dataclass
class LLMResponse:
    content: str
    model: str
    provider: str
    prompt_tokens: int
    completion_tokens: int
    generation_ms: float
    used_fallback: bool

def _format_model_string(provider: str | None, model: str | None) -> str | None:
    if not model:
        return None
    model_str = model.strip()
    if provider:
        p = provider.strip().lower()
        if not model_str.startswith(f"{p}/"):
            return f"{p}/{model_str}"
    return model_str

class LLMClient:
    def __init__(self):
        self.primary = None
        self.fallback = None
        self.refresh_providers()

    def refresh_providers(self):
        if self.primary is None:
            primary_model = _format_model_string(settings.LLM_PROVIDER, settings.LLM_MODEL)
            primary_key = (settings.LLM_API_KEY or "").strip()
            self.primary = {
                "model": primary_model,
                "api_key": primary_key,
            } if primary_model and primary_key else None

        if self.fallback is None:
            fallback_key = (
                settings.LLM_FALLBACK_API_KEY 
                or os.environ.get("GROQ_FALLBACK_API_KEY") 
                or os.environ.get("GROQ_SECONDARY_API_KEY") 
                or os.environ.get("GROQ_FALLBACK_KEY") 
                or os.environ.get("LLM_SECONDARY_API_KEY") 
                or ""
            ).strip()

            fallback_provider = settings.LLM_FALLBACK_PROVIDER or "groq"
            fallback_model_name = settings.LLM_FALLBACK_MODEL or "openai/gpt-oss-20b"
            fallback_model = _format_model_string(fallback_provider, fallback_model_name)

            self.fallback = {
                "model": fallback_model,
                "api_key": fallback_key,
            } if fallback_model and fallback_key else None

    async def generate(self, messages: list, temperature: float = 0.4) -> LLMResponse:
        self.refresh_providers()

        litellm_messages = []
        for msg in messages:
            role = "user"
            msg_type = getattr(msg, "type", "")
            if msg_type == "system":
                role = "system"
            litellm_messages.append({"role": role, "content": getattr(msg, "content", str(msg))})

        providers_to_try = []
        if self.primary and self.primary.get("api_key"):
            providers_to_try.append(("primary", self.primary))
        if self.fallback and self.fallback.get("api_key"):
            providers_to_try.append(("fallback", self.fallback))

        if not providers_to_try:
            default_model = _format_model_string(settings.LLM_PROVIDER, settings.LLM_MODEL) or "groq/llama-3.3-70b-versatile"
            providers_to_try.append(("primary", {"model": default_model, "api_key": settings.LLM_API_KEY}))

        errors = []
        max_attempts_per_provider = 2

        for provider_name, provider_config in providers_to_try:
            for attempt in range(1, max_attempts_per_provider + 1):
                try:
                    start_time = time.perf_counter()
                    response = await litellm.acompletion(
                        messages=litellm_messages,
                        temperature=temperature,
                        max_tokens=getattr(settings, "LLM_MAX_TOKENS", 400),
                        timeout=settings.LLM_TIMEOUT_SECONDS,
                        **provider_config
                    )
                    duration_ms = (time.perf_counter() - start_time) * 1000
                    used_fallback = (provider_name == "fallback")
                    provider_used = provider_config["model"].split("/")[0]

                    prompt_tokens = 0
                    completion_tokens = 0
                    if hasattr(response, "usage") and response.usage:
                        prompt_tokens = getattr(response.usage, "prompt_tokens", 0)
                        completion_tokens = getattr(response.usage, "completion_tokens", 0)

                    resp_model = getattr(response, "model", None) or provider_config["model"]

                    return LLMResponse(
                        content=response.choices[0].message.content,
                        model=resp_model,
                        provider=provider_used,
                        prompt_tokens=prompt_tokens,
                        completion_tokens=completion_tokens,
                        generation_ms=duration_ms,
                        used_fallback=used_fallback
                    )
                except Exception as exc:
                    err_msg = str(exc)
                    logger.warning(
                        "llm_provider_attempt_failed",
                        provider=provider_name,
                        model=provider_config["model"],
                        attempt=attempt,
                        error=err_msg
                    )
                    errors.append(f"[{provider_name}:{provider_config['model']} attempt {attempt}] {err_msg}")
                    
                    # If authentication/invalid key error, don't waste retries on this provider
                    err_msg_lower = err_msg.lower()
                    if any(k in err_msg_lower for k in ["authenticationerror", "incorrect api key", "invalid api key", "invalid_api_key"]):
                        break

                    if attempt < max_attempts_per_provider:
                        # Longer backoff for rate limits
                        sleep_time = 2.0 if ("RateLimitError" in err_msg or "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg) else (0.2 * attempt)
                        await asyncio.sleep(sleep_time)

        summary_error = "; ".join(errors)
        logger.error("all_llm_providers_failed", summary=summary_error)
        raise LLMGenerationError(f"LLM provider error occurred: {summary_error}")

llm_client = LLMClient()

