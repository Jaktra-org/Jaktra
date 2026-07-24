from fastapi import APIRouter, HTTPException
from src.agents.negotiation_agent import NegotiationRequest, NegotiationResponse, NegotiationAgent

router = APIRouter(prefix="/agents", tags=["Agents"])

negotiation_agent = NegotiationAgent()

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

