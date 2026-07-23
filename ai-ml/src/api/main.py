from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from src.api.routes import health, generation, risk, agents
from src.api.middleware.auth import verify_service_key
from src.api.middleware.logging import LoggingMiddleware

app = FastAPI(
    title="Jaktra AI-ML Service",
    description="Agent executor service for Jaktra",
    version="1.0.0",
)

app.add_middleware(LoggingMiddleware)

app.include_router(health.router)
app.include_router(generation.router, dependencies=[Depends(verify_service_key)])
app.include_router(risk.router, dependencies=[Depends(verify_service_key)])
app.include_router(agents.router, dependencies=[Depends(verify_service_key)])
