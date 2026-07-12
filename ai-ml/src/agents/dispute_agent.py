import json
from pydantic import BaseModel
from typing import Optional, List, Dict
from src.security import sanitize_input
from src.llm_client import llm_client
from prompts.dispute_prompt import DISPUTE_SYSTEM_PROMPT, DISPUTE_USER_PROMPT

class DisputeRequest(BaseModel):
    inbound_text: str
    invoice_id: str
    invoice_no: str
    client_name: str
    invoice_amount: str
    due_date: str
    prior_communications: Optional[List[Dict]] = None

class DisputeResponse(BaseModel):
    classification: str  # "dispute" | "question" | "payment_promise" | "unclear"
    confidence: float
    suggested_response: str
    reasoning: str

class DisputeAgent:
    """
    Handles invoice dispute and reply classification.
    Input: customer email reply and invoice context.
    Output: classification intent, confidence score, suggested draft reply, reasoning.
    """
    async def handle(self, request: DisputeRequest) -> DisputeResponse:
        # Sanitize customer inbound text to prevent prompt injection
        clean_inbound = sanitize_input(request.inbound_text)
        
        # Format prior communications list
        prior_str = ""
        if request.prior_communications:
            for c in request.prior_communications:
                subj = c.get("subject", "No Subject")
                body = c.get("body", "No Body")
                sent_at = c.get("sentAt") or c.get("sent_at") or "Unknown Date"
                prior_str += f"- Sent at: {sent_at}\n  Subject: {subj}\n  Body: {body}\n\n"
        else:
            prior_str = "No prior communications."

        # Format user prompt
        user_prompt = DISPUTE_USER_PROMPT.format(
            inbound_text=clean_inbound,
            invoice_id=request.invoice_id,
            invoice_no=request.invoice_no,
            client_name=request.client_name,
            invoice_amount=request.invoice_amount,
            due_date=request.due_date,
            prior_communications=prior_str
        )

        messages = [
            {"role": "system", "content": DISPUTE_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        # Call the LLM
        response = await llm_client.generate(messages, temperature=0.2)
        
        content = response.content.strip()
        
        # Clean markdown formatting block if LLM outputs it (e.g. ```json ... ```)
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        try:
            parsed = json.loads(content)
            classification = parsed.get("classification", "unclear").lower()
            if classification not in ["dispute", "question", "payment_promise", "unclear"]:
                classification = "unclear"
            
            confidence = float(parsed.get("confidence", 0.0))
            suggested_response = parsed.get("suggested_response", "")
            reasoning = parsed.get("reasoning", "")
            
            return DisputeResponse(
                classification=classification,
                confidence=confidence,
                suggested_response=suggested_response,
                reasoning=reasoning
            )
        except Exception as e:
            # Safe fallback in case of JSON parsing or schema mismatch error
            return DisputeResponse(
                classification="unclear",
                confidence=0.0,
                suggested_response="",
                reasoning=f"Failed to parse LLM response as JSON: {str(e)}. Original response: {response.content}"
            )
