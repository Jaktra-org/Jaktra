from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, Request, Response
from src.api.routes import health, generation, risk, agents
from src.api.middleware.auth import verify_service_key
from src.api.middleware.logging import LoggingMiddleware
from src.api.config import settings

app = FastAPI(
    title="Jaktra AI-ML Service",
    description="Agent executor service for Jaktra",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.middleware("http")
async def gate_docs_middleware(request: Request, call_next):
    if request.url.path in ["/docs", "/redoc", "/openapi.json"]:
        if settings.ENVIRONMENT != "development":
            return Response(status_code=404, content="Not Found")
    return await call_next(request)

app.add_middleware(LoggingMiddleware)

app.include_router(health.router)
app.include_router(generation.router, dependencies=[Depends(verify_service_key)])
app.include_router(risk.router, dependencies=[Depends(verify_service_key)])
app.include_router(agents.router, dependencies=[Depends(verify_service_key)])
