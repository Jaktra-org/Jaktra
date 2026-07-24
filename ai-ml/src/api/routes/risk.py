from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import asyncio

from src.risk.scorer import RiskScorer, RiskFeatures, RiskResult

router = APIRouter(prefix="/risk", tags=["Risk"])
scorer = RiskScorer()

class RiskScoreRequest(BaseModel):
    invoice_id: str = Field(..., max_length=100)
    features: RiskFeatures

class RiskScoreResponse(RiskResult):
    invoice_id: str

class BatchRiskScoreRequest(BaseModel):
    invoices: List[RiskScoreRequest] = Field(..., min_length=1, max_length=100)

class BatchRiskScoreResponse(BaseModel):
    results: List[RiskScoreResponse]

@router.post("/score", response_model=RiskScoreResponse)
async def score_risk(request: RiskScoreRequest):
    try:
        result = await asyncio.to_thread(scorer.score, request.features)
        return RiskScoreResponse(
            invoice_id=request.invoice_id,
            risk_score=result.risk_score,
            risk_level=result.risk_level,
            model_version=result.model_version,
            features_used=result.features_used
        )
    except Exception as e:
        from src.api.logging import logger
        logger.error("score_risk_failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=400, detail="Failed to compute risk score")

@router.post("/score/batch", response_model=BatchRiskScoreResponse)
async def score_risk_batch(request: BatchRiskScoreRequest):
    results = []
    from src.api.logging import logger
    
    async def _score_item(invoice):
        try:
            result = await asyncio.to_thread(scorer.score, invoice.features)
            return RiskScoreResponse(
                invoice_id=invoice.invoice_id,
                risk_score=result.risk_score,
                risk_level=result.risk_level,
                model_version=result.model_version,
                features_used=result.features_used
            )
        except Exception as e:
            logger.error("score_risk_batch_item_failed", error=str(e), invoice_id=invoice.invoice_id, exc_info=True)
            raise HTTPException(status_code=400, detail=f"Error scoring {invoice.invoice_id}")

    try:
        tasks = [_score_item(inv) for inv in request.invoices]
        results = await asyncio.gather(*tasks)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("score_risk_batch_failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=400, detail="Batch risk scoring encountered an error")
            
    return BatchRiskScoreResponse(results=results)
