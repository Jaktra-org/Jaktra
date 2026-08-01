from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Service
    ENVIRONMENT: str = "development"
    SERVICE_HOST: str = "0.0.0.0"
    SERVICE_PORT: int = 8000
    SERVICE_KEY: str = Field(default="dev-service-key-placeholder", alias="SERVICE_KEY")
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    LLM_PROVIDER: str = "groq"
    LLM_MODEL: str = "llama-3.1-8b-instant"
    LLM_API_KEY: str = Field(default="gsk_placeholder_key")
    LLM_TEMPERATURE: float = 0.4
    LLM_MAX_TOKENS: int = 1024
    LLM_TIMEOUT_SECONDS: int = 30

    LLM_FALLBACK_PROVIDER: str | None = None
    LLM_FALLBACK_MODEL: str | None = None
    LLM_FALLBACK_API_KEY: str | None = None

    RISK_MODEL_PATH: str = "src/models/risk_scorer.joblib"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
