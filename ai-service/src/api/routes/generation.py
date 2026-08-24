from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Literal
from src.api.services.content_generator import ContentGenerator
from src.prompt_registry import registry
from src.llm_client import llm_client
from src.api.config import settings
import asyncio
import time

router = APIRouter(prefix="/followup", tags=["Generation"])
content_generator = ContentGenerator(prompt_registry=registry, llm_client=llm_client)

class FollowupRequest(BaseModel):
    invoice_id: str = Field(..., max_length=255)
    invoice_no: str = Field("", max_length=255)
    client_name: str = Field("Valued Customer", max_length=255)
    contact_email: str = Field("", max_length=255)
    invoice_amount: str = Field("0.00", max_length=100)
    currency: str = Field("INR", max_length=20)
    due_date: str = Field("", max_length=255)
    days_overdue: int = Field(0)
    urgency_tier: str = Field("stage_1_warm", max_length=100)
    channel: Literal["email", "sms", "whatsapp"] = "email"
    followup_count: int = Field(0)
    payment_link: Optional[str] = Field(None, max_length=2048)
    bank_details: Optional[str] = Field(None, max_length=2048)
    sender_name: Optional[str] = Field(None, max_length=200)
    company_name: Optional[str] = Field(None, max_length=200)
    invoice_subject: Optional[str] = Field(None, max_length=255)
    installment_number: Optional[int] = Field(None)
    total_installments: Optional[int] = Field(None)

class Content(BaseModel):
    subject: str = ""
    html_body: str = ""
    plain_body: str = ""

class Metadata(BaseModel):
    tier_used: str = ""
    model: str = ""
    generation_ms: float = 0.0
    token_count: int = 0

class FollowupResponse(BaseModel):
    invoice_id: str = ""
    channel: str = "email"
    content: Optional[Content] = None
    metadata: Optional[Metadata] = None
    error: Optional[str] = None

class BatchFollowupRequest(BaseModel):
    invoices: list[FollowupRequest]
    concurrency: int = Field(3, ge=1, le=10)

class BatchResult(BaseModel):
    invoice_id: str
    status: str
    content: Optional[Content] = None
    metadata: Optional[Metadata] = None
    error: Optional[str] = None
    retryable: Optional[bool] = None

class BatchSummary(BaseModel):
    total: int
    succeeded: int
    failed: int
    total_ms: float

class BatchFollowupResponse(BaseModel):
    results: list[BatchResult]
    summary: BatchSummary

from src.exceptions import OutputValidationError, PromptInjectionDetectedError

@router.post("", response_model=FollowupResponse)
async def generate_followup(request: FollowupRequest):
    from src.exceptions import LLMGenerationError, OutputValidationError, PromptInjectionDetectedError
    from src.api.routes.health import stats
    from src.api.logging import logger
    
    stats["is_processing"] = True
    start_time = time.perf_counter()
    try:
        result = await content_generator.generate(request)
        duration_ms = (time.perf_counter() - start_time) * 1000
        stats["requests_served"] += 1
        stats["total_generation_ms"] += int(duration_ms)
    except ValueError as e:
        stats["errors_last_hour"] += 1
        if "legal_escalation" in str(e) or "does not have an automated prompt" in str(e):
            raise HTTPException(status_code=400, detail="TIER_NOT_AUTOMATABLE")
        if "UNSUPPORTED_CHANNEL" in str(e):
            raise HTTPException(status_code=400, detail="UNSUPPORTED_CHANNEL")
        raise HTTPException(status_code=400, detail=str(e))
    except (OutputValidationError, PromptInjectionDetectedError):
        stats["errors_last_hour"] += 1
        raise HTTPException(status_code=422, detail="GENERATION_VALIDATION_FAILED")
    except LLMGenerationError as e:
        stats["errors_last_hour"] += 1
        logger.error("llm_generation_failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=502,
            detail={"error": "Failed to generate communication content due to an upstream LLM error.", "retryable": True}
        )
    except Exception as e:
        stats["errors_last_hour"] += 1
        logger.error("generation_unknown_error", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        stats["is_processing"] = False
        
    plain_body = getattr(result, "plain_body", "") or ""
    html_body = getattr(result, "html_body", "") or plain_body
    subject = getattr(result, "subject", "") or ""
    meta = getattr(result, "metadata", {}) or {}

    return FollowupResponse(
        invoice_id=str(request.invoice_id or ""),
        channel=str(request.channel or "email"),
        content=Content(
            subject=str(subject or ""),
            html_body=str(html_body or ""),
            plain_body=str(plain_body or "")
        ),
        metadata=Metadata(
            tier_used=str(meta.get("tier_used", "") or ""),
            model=str(meta.get("model", "") or ""),
            generation_ms=float(meta.get("generation_ms", 0.0) or 0.0),
            token_count=int(meta.get("token_count", 0) or 0)
        )
    )

async def _process_invoice_for_batch(invoice: FollowupRequest, sem: asyncio.Semaphore, delay: float = 0.0) -> dict:
    from src.exceptions import LLMGenerationError, OutputValidationError, PromptInjectionDetectedError
    from src.api.routes.health import stats
    from src.api.logging import logger
    
    if delay > 0:
        await asyncio.sleep(delay)

    async with sem:
        stats["is_processing"] = True
        start_time = time.perf_counter()
        try:
            # Enforce 60 second timeout per invoice
            result = await asyncio.wait_for(
                content_generator.generate(invoice),
                timeout=60.0
            )
            duration_ms = (time.perf_counter() - start_time) * 1000
            stats["requests_served"] += 1
            stats["total_generation_ms"] += int(duration_ms)
        except asyncio.TimeoutError:
            stats["errors_last_hour"] += 1
            logger.warning("batch_invoice_timeout", invoice_id=invoice.invoice_id)
            return {
                "invoice_id": invoice.invoice_id,
                "status": "error",
                "error": "TIMEOUT",
                "retryable": True
            }
        except ValueError as e:
            stats["errors_last_hour"] += 1
            if "legal_escalation" in str(e) or "does not have an automated prompt" in str(e):
                return {
                    "invoice_id": invoice.invoice_id,
                    "status": "error",
                    "error": "TIER_NOT_AUTOMATABLE",
                    "retryable": False
                }
            return {
                "invoice_id": invoice.invoice_id,
                "status": "error",
                "error": str(e),
                "retryable": False
            }
        except (OutputValidationError, PromptInjectionDetectedError):
            stats["errors_last_hour"] += 1
            return {
                "invoice_id": invoice.invoice_id,
                "status": "error",
                "error": "GENERATION_VALIDATION_FAILED",
                "retryable": False
            }
        except LLMGenerationError as e:
            stats["errors_last_hour"] += 1
            logger.error("batch_llm_generation_failed", error=str(e), invoice_id=invoice.invoice_id, exc_info=True)
            return {
                "invoice_id": invoice.invoice_id,
                "status": "error",
                "error": "Upstream LLM generation failed",
                "retryable": True
            }
        except Exception as e:
            stats["errors_last_hour"] += 1
            logger.error("batch_invoice_unknown_error", error=str(e), invoice_id=invoice.invoice_id, exc_info=True)
            return {
                "invoice_id": invoice.invoice_id,
                "status": "error",
                "error": "Internal processing failed",
                "retryable": False
            }
        finally:
            stats["is_processing"] = False

        plain_body = getattr(result, "plain_body", "") or ""
        html_body = getattr(result, "html_body", "") or plain_body
        subject = getattr(result, "subject", "") or ""
        meta = getattr(result, "metadata", {}) or {}

        return {
            "invoice_id": str(invoice.invoice_id or ""),
            "status": "success",
            "content": Content(
                subject=str(subject or ""),
                html_body=str(html_body or ""),
                plain_body=str(plain_body or "")
            ),
            "metadata": Metadata(
                tier_used=str(meta.get("tier_used", "") or ""),
                model=str(meta.get("model", "") or ""),
                generation_ms=float(meta.get("generation_ms", 0.0) or 0.0),
                token_count=int(meta.get("token_count", 0) or 0)
            )
        }

@router.post("/batch", response_model=BatchFollowupResponse)
async def generate_followup_batch(request: BatchFollowupRequest):
    if len(request.invoices) > 50:
        raise HTTPException(status_code=400, detail="BATCH_SIZE_EXCEEDED")
    
    if request.concurrency < 1 or request.concurrency > 10:
        raise HTTPException(status_code=400, detail="Invalid concurrency. Must be between 1 and 10.")
        
    effective_concurrency = min(request.concurrency, 2)
    sem = asyncio.Semaphore(effective_concurrency)
    start_time = time.perf_counter()
    
    # Rate-pace outgoing LLM generation requests (150ms spacing) for fast response times
    tasks = [_process_invoice_for_batch(inv, sem, delay=idx * 0.15) for idx, inv in enumerate(request.invoices)]
    results_raw = await asyncio.gather(*tasks)
    
    results = []
    succeeded = 0
    failed = 0
    
    for r in results_raw:
        if r["status"] == "success":
            succeeded += 1
            results.append(BatchResult(
                invoice_id=r["invoice_id"],
                status="success",
                content=r["content"],
                metadata=r["metadata"]
            ))
        else:
            failed += 1
            results.append(BatchResult(
                invoice_id=r["invoice_id"],
                status="error",
                error=r["error"],
                retryable=r["retryable"]
            ))
            
    total_ms = (time.perf_counter() - start_time) * 1000
    
    return BatchFollowupResponse(
        results=results,
        summary=BatchSummary(
            total=len(request.invoices),
            succeeded=succeeded,
            failed=failed,
            total_ms=total_ms
        )
    )
