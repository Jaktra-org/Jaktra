from fastapi import FastAPI
from api.routes import health, generation, risk, agents

app = FastAPI(
    title="CreditOps AI-ML Service",
    description="Agent executor service for CreditOps",
    version="1.0.0",
)

app.include_router(health.router)
app.include_router(generation.router)
app.include_router(risk.router)
app.include_router(agents.router)
