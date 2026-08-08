import json
import re
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from src.prompts.dispute_prompt import DISPUTE_SYSTEM_PROMPT, DISPUTE_USER_PROMPT
from src.security import sanitize_input
from src.llm_client import llm_client
from src.api.logging import logger

class DisputeRequest(BaseModel):
    inbound_text: str = Field(..., max_length=10000)
    invoice_id: str = Field(..., max_length=100)
    invoice_no: str = Field(..., max_length=100)
    client_name: str = Field(..., max_length=200)
    invoice_amount: str = Field(..., max_length=50)
    due_date: str = Field(..., max_length=50)
    prior_communications: Optional[List[Dict[str, Any]]] = None

class DisputeResponse(BaseModel):
    classification: Literal["dispute", "question", "payment_promise", "unclear"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    suggested_response: str
    reasoning: str

class DisputeAgent:
    """
    Handles customer dispute & inquiry analysis.
    Reads inbound customer emails/portal submissions, sanitizes input to prevent prompt injection,
    calls LLM to classify intent and draft response, and returns validated JSON output.
    """
    async def handle(self, request: DisputeRequest) -> DisputeResponse:
        # Sanitize untrusted inputs to prevent prompt injection
        clean_inbound = sanitize_input(request.inbound_text or "")
        clean_client_name = sanitize_input(request.client_name or "")
        clean_invoice_no = sanitize_input(request.invoice_no or "")
        clean_invoice_amount = sanitize_input(request.invoice_amount or "")
        clean_due_date = sanitize_input(request.due_date or "")

        # Format prior communications securely
        comms_text = "None"
        if request.prior_communications:
            formatted_comms = []
            for c in request.prior_communications[:5]:
                subj = sanitize_input(str(c.get("subject", "") or ""))
                body = sanitize_input(str(c.get("body", "") or ""))
                formatted_comms.append(f"- Subject: {subj}\n  Body: {body}")
            if formatted_comms:
                comms_text = "\n".join(formatted_comms)

        system_prompt = DISPUTE_SYSTEM_PROMPT
        user_prompt = DISPUTE_USER_PROMPT.format(
            inbound_text=clean_inbound,
            invoice_id=request.invoice_id,
            invoice_no=clean_invoice_no,
            client_name=clean_client_name,
            invoice_amount=clean_invoice_amount,
            due_date=clean_due_date,
            prior_communications=comms_text,
        )

        class MessageObj:
            def __init__(self, type_str: str, content_str: str):
                self.type = type_str
                self.content = content_str

        messages = [
            MessageObj("system", system_prompt),
            MessageObj("user", user_prompt),
        ]

        try:
            response = await llm_client.generate(messages, temperature=0.2)
            content = response.content.strip()

            # Extract JSON block using regex to handle markdown code fences cleanly
            json_match = re.search(r"\{[\s\S]*\}", content)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = content

            data = json.loads(json_str)

            classification = data.get("classification", "unclear")
            if classification not in ("dispute", "question", "payment_promise", "unclear"):
                classification = "unclear"

            raw_confidence = data.get("confidence", 0.0)
            try:
                confidence = float(raw_confidence)
                confidence = max(0.0, min(1.0, confidence))
            except (ValueError, TypeError):
                confidence = 0.0

            suggested_response = str(data.get("suggested_response", "") or "").strip()
            reasoning = str(data.get("reasoning", "") or "").strip()

            return DisputeResponse(
                classification=classification,  # type: ignore
                confidence=confidence,
                suggested_response=suggested_response,
                reasoning=reasoning,
            )
        except Exception as e:
            logger.error("dispute_agent_llm_failed", error=str(e), exc_info=True)
            return DisputeResponse(
                classification="unclear",
                confidence=0.0,
                suggested_response="",
                reasoning=f"AI analysis failed: {str(e)}",
            )

