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
    LLM_MODEL: str = "llama-3.1-8b-instant"
    LLM_API_KEY: str = Field(default="", alias="LLM_API_KEY")
    LLM_TEMPERATURE: float = 0.4
    LLM_MAX_TOKENS: int = 1024
    LLM_TIMEOUT_SECONDS: int = 30
    MAX_CONCURRENT_LLM_CALLS: int = 3

    LLM_FALLBACK_PROVIDER: str | None = Field(default="gemini", alias="LLM_FALLBACK_PROVIDER")
    LLM_FALLBACK_MODEL: str | None = Field(default="gemini-3.6-flash", alias="LLM_FALLBACK_MODEL")
    LLM_FALLBACK_API_KEY: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_FALLBACK_API_KEY", "Gemini_API_Key", "GEMINI_API_KEY", "GEMINI_KEY")
    )

    RISK_MODEL_PATH: str = "src/models/risk_scorer.joblib"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

