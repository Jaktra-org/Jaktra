from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices

class Settings(BaseSettings):
    # Service
    ENVIRONMENT: str = "development"
    SERVICE_HOST: str = "0.0.0.0"
    SERVICE_PORT: int = 8000
    SERVICE_KEY: str = Field(
        default="dev-service-key-placeholder",
        validation_alias=AliasChoices("SERVICE_KEY", "AI_ML_SERVICE_KEY")
    )
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "groq/compound-mini"
    LLM_API_KEY: str = Field(default="", alias="LLM_API_KEY")
    LLM_TEMPERATURE: float = 0.3
    # Token budget:
    # A complete 4-paragraph professional email requires ~140-220 tokens.
    # Non-reasoning models produce direct email outputs without chain-of-thought tokens.
    # Budget set to 500 tokens — safe for all email tones with zero truncation or waste.
    LLM_MAX_TOKENS: int = 500
    LLM_TIMEOUT_SECONDS: int = 30
    MAX_CONCURRENT_LLM_CALLS: int = 3

    LLM_FALLBACK_PROVIDER: str | None = Field(default="groq", alias="LLM_FALLBACK_PROVIDER")
    LLM_FALLBACK_MODEL: str | None = Field(default="groq/compound-mini", alias="LLM_FALLBACK_MODEL")
    LLM_FALLBACK_API_KEY: str | None = Field(
        default=None,
        validation_alias=AliasChoices(
            "LLM_FALLBACK_API_KEY",
            "GROQ_FALLBACK_API_KEY",
            "GROQ_SECONDARY_API_KEY",
            "GROQ_FALLBACK_KEY",
            "LLM_SECONDARY_API_KEY"
        )
    )

    RISK_MODEL_PATH: str = "src/models/risk_scorer.joblib"
    # Sender identity (used when request.sender_name is not provided)
    SMTP_SENDER_NAME: str = Field(default="Finance Department", alias="SMTP_SENDER_NAME")
    # Optional org-wide bank details injected into CTA when no payment link is available
    BANK_DETAILS: str = Field(default="", alias="BANK_DETAILS")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

