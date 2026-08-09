from fastapi import APIRouter, HTTPException
from src.agents.negotiation_agent import NegotiationRequest, NegotiationResponse, NegotiationAgent
from src.agents.dispute_agent import (
    DisputeRequest, DisputeResponse, DisputeAgent,
    DisputeDraftRequest, DisputeDraftResponse
)

router = APIRouter(prefix="/agents", tags=["Agents"])

negotiation_agent = NegotiationAgent()
dispute_agent = DisputeAgent()

@router.post("/negotiate", response_model=NegotiationResponse)
async def handle_negotiate(request: NegotiationRequest):
    try:
        return await negotiation_agent.handle(request)
    except NotImplementedError:
        schema_info = NegotiationResponse.model_json_schema()
        raise HTTPException(
            status_code=501, 
            detail={
                "error": "NOT_IMPLEMENTED",
                "schema": schema_info
            }
        )

@router.post("/dispute", response_model=DisputeResponse)
async def handle_dispute(request: DisputeRequest):
    return await dispute_agent.handle(request)

@router.post("/dispute/draft", response_model=DisputeDraftResponse)
async def handle_dispute_draft(request: DisputeDraftRequest):
    return await dispute_agent.generate_draft(request)



