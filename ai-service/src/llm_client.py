import os
import re
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

KNOWN_PROVIDERS = {"groq", "gemini", "anthropic", "azure", "cohere", "ollama", "mistral", "bedrock", "vertex_ai"}

def _format_model_string(provider: str | None, model: str | None) -> str | None:
    if not model:
        return None
    model_clean = model.strip()
    p = (provider or "groq").strip().lower()
    if model_clean.startswith(f"{p}/"):
        return model_clean
    if p == "groq" and model_clean.startswith("openai/"):
        return f"groq/{model_clean}"
    first_part = model_clean.split("/")[0].lower()
    if "/" in model_clean and first_part in KNOWN_PROVIDERS:
        return model_clean
    return f"{p}/{model_clean}"

class LLMClient:
    def __init__(self):
        self.primary = None
        self.fallback = None
        self.refresh_providers(force=True)

    def refresh_providers(self, force: bool = False):
        if force or self.primary is None:
            primary_model = _format_model_string(settings.LLM_PROVIDER, settings.LLM_MODEL)
            primary_key = (settings.LLM_API_KEY or "").strip()
            self.primary = {
                "model": primary_model,
                "api_key": primary_key,
            } if primary_model and primary_key else None

        if force or self.fallback is None:
            fallback_model = _format_model_string(settings.LLM_FALLBACK_PROVIDER, settings.LLM_FALLBACK_MODEL)
            fallback_key = (
                settings.LLM_FALLBACK_API_KEY
                or os.environ.get("GROQ_FALLBACK_API_KEY")
                or os.environ.get("GROQ_SECONDARY_API_KEY")
                or os.environ.get("GROQ_FALLBACK_KEY")
                or os.environ.get("LLM_SECONDARY_API_KEY")
                or ""
            ).strip()
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

        for provider_name, provider_config in providers_to_try:
            attempt = 1
            max_attempts = 6  # Up to 6 retries for rate limits

            while attempt <= max_attempts:
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
                    msg_obj = response.choices[0].message
                    content_text = getattr(msg_obj, "content", None) or getattr(msg_obj, "reasoning_content", None) or ""
                    content_text = re.sub(r"<think>.*?</think>", "", content_text, flags=re.DOTALL).strip()

                    return LLMResponse(
                        content=content_text,
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

                    is_rate_limit = any(k in err_msg for k in ["RateLimitError", "429", "RESOURCE_EXHAUSTED", "rate_limit", "rate_limit_exceeded"])

                    # Non-rate-limit errors cap at 2 attempts
                    if not is_rate_limit and attempt >= 2:
                        break

                    if attempt < max_attempts:
                        # Parse exact retry-after wait time requested by provider (e.g. Groq "Please try again in 5.295s")
                        match = re.search(r"(?:try again in|retry after)\s+(\d+(?:\.\d+)?)s?", err_msg, re.IGNORECASE)
                        if match:
                            suggested_wait = float(match.group(1)) + 0.5
                            sleep_time = max(suggested_wait, 2.0)
                        elif is_rate_limit:
                            sleep_time = 6.0
                        else:
                            sleep_time = 0.5 * attempt

                        logger.info(
                            "rate_limit_backoff_sleep",
                            provider=provider_name,
                            sleep_seconds=sleep_time,
                            attempt=attempt,
                            message=f"Rate limit encountered. Sleeping {sleep_time:.2f}s before retrying generation..."
                        )
                        await asyncio.sleep(sleep_time)

                    attempt += 1

        summary_error = "; ".join(errors)
        logger.error("all_llm_providers_failed", summary=summary_error)
        raise LLMGenerationError(f"LLM provider error occurred: {summary_error}")

llm_client = LLMClient()
