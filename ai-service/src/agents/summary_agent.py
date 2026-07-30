import json
import re
from typing import Optional
from pydantic import BaseModel, Field
from src.security import sanitize_input
from src.llm_client import llm_client
from src.api.logging import logger

EMAIL_SUMMARY_SYSTEM_PROMPT = """You are an AI Email Summarizer Agent.
Your job is to read an email (either inbound from a customer or outbound from a vendor/agent) and write a single concise 1-sentence summary capturing the core purpose or message content.

CRITICAL RULES:
1. Focus purely on the core substance/intent (e.g. "Customer disputes invoice amount", "Vendor confirms 5% discount applied", "Reminder sent for pending invoice INV-101").
2. DO NOT include email salutations ("Hi", "Hello", "Dear"), sign-offs ("Thank you", "Best regards"), or boilerplate text.
3. Output ONLY a valid raw JSON object: {"summary": "string"}
"""

class SummaryRequest(BaseModel):
    email_text: str = Field(..., max_length=15000)
    subject: Optional[str] = Field(None, max_length=500)
    direction: Optional[str] = Field("inbound", max_length=50)

class SummaryResponse(BaseModel):
    summary: str

class MessageObj:
    def __init__(self, type_str: str, content_str: str):
        self.type = type_str
        self.content = content_str

class SummaryAgent:
    """
    Generates concise 1-line AI summaries for inbound & outbound emails at creation time.
    """
    async def summarize(self, request: SummaryRequest) -> SummaryResponse:
        clean_text = sanitize_input(request.email_text or "")
        clean_subj = sanitize_input(request.subject or "")
        direction = request.direction or "inbound"

        if not clean_text and not clean_subj:
            return SummaryResponse(summary="")

        user_prompt = f"Email Direction: {direction}\nSubject: {clean_subj}\n\nEmail Content:\n\"\"\"{clean_text}\"\"\""

        messages = [
            MessageObj("system", EMAIL_SUMMARY_SYSTEM_PROMPT),
            MessageObj("user", user_prompt),
        ]

        try:
            response = await llm_client.generate(messages, temperature=0.2)
            content = response.content.strip()

            json_match = re.search(r"\{[\s\S]*\}", content)
            json_str = json_match.group(0) if json_match else content

            data = json.loads(json_str)
            summary = str(data.get("summary", "") or "").strip()

            return SummaryResponse(summary=summary)
        except Exception as e:
            logger.error("summary_agent_llm_failed", error=str(e), exc_info=True)
            fallback = clean_text[:120].strip()
            return SummaryResponse(summary=fallback)
