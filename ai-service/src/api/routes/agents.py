from fastapi import APIRouter
from src.agents.dispute_agent import (
    DisputeRequest, DisputeResponse, DisputeAgent,
    DisputeDraftRequest, DisputeDraftResponse
)
from src.agents.summary_agent import SummaryRequest, SummaryResponse, SummaryAgent

router = APIRouter(prefix="/agents", tags=["Agents"])

dispute_agent = DisputeAgent()
summary_agent = SummaryAgent()

@router.post("/dispute", response_model=DisputeResponse)
async def handle_dispute(request: DisputeRequest):
    return await dispute_agent.handle(request)

@router.post("/dispute/draft", response_model=DisputeDraftResponse)
async def handle_dispute_draft(request: DisputeDraftRequest):
    return await dispute_agent.generate_draft(request)

@router.post("/summarize", response_model=SummaryResponse)
async def handle_summarize(request: SummaryRequest):
    return await summary_agent.summarize(request)



