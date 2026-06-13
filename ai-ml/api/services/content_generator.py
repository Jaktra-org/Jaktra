from pydantic import BaseModel
from typing import Optional
from src.prompt_registry import PromptRegistry, TierNotAutomatableError, UnknownPromptError
from src.llm_client import LLMClient
from src.security import sanitize_input, validate_email_output, validate_sms_output, validate_whatsapp_output
from src.exceptions import LLMGenerationError
from api.config import settings
from api.logging import logger

class GenerationResult(BaseModel):
    subject: Optional[str] = None
    html_body: Optional[str] = None
    plain_body: Optional[str] = None
    metadata: dict

class ContentGenerator:
    def __init__(self, prompt_registry: PromptRegistry, llm_client: LLMClient):
        self.prompts = prompt_registry
        self.llm = llm_client

    async def generate(self, request) -> GenerationResult:
        if request.channel not in ["email", "sms", "whatsapp"]:
            raise ValueError(f"UNSUPPORTED_CHANNEL: {request.channel}")

        try:
            prompt = self.prompts.get_prompt(request.channel, request.urgency_tier)
        except TierNotAutomatableError:
            raise ValueError(f"{request.urgency_tier} does not have an automated prompt.")
        except UnknownPromptError as e:
            raise ValueError(str(e))

        sender_name = getattr(settings, "SMTP_SENDER_NAME", "Finance Department")
        payment_link = getattr(request, "payment_link", None) or getattr(settings, "PAYMENT_LINK", "")
        bank_details = getattr(request, "bank_details", None) or getattr(settings, "BANK_DETAILS", "")

        format_instruction = ""
        if request.channel == "email":
            format_instruction = (
                "\nRespond with ONLY the email in this exact format — no extra commentary:\n"
                "\nSubject: <subject line>\n\nBody:\n<email body>"
            )

        messages = prompt.format_messages(
            client_name=sanitize_input(getattr(request, "client_name", "")),
            invoice_no=sanitize_input(getattr(request, "invoice_no", "")),
            invoice_amount=sanitize_input(str(getattr(request, "invoice_amount", ""))),
            due_date=sanitize_input(str(getattr(request, "due_date", ""))[:10]),
            days_overdue=getattr(request, "days_overdue", 0),
            followup_count=getattr(request, "followup_count", 0),
            sender_name=sender_name,
            payment_link=payment_link,
            bank_details=bank_details,
            format_instruction=format_instruction
        )

        llm_response = await self.llm.generate(messages, temperature=settings.LLM_TEMPERATURE)

        metadata = {
            "tier_used": request.urgency_tier,
            "model": llm_response.model,
            "generation_ms": round(llm_response.generation_ms, 2),
            "token_count": llm_response.completion_tokens + llm_response.prompt_tokens
        }
        
        logger.info(
            "generation_complete",
            invoice_id=request.invoice_id,
            tier=request.urgency_tier,
            channel=request.channel,
            model=llm_response.model,
            provider=llm_response.provider,
            generation_ms=round(llm_response.generation_ms, 2),
            token_count=llm_response.completion_tokens + llm_response.prompt_tokens,
            used_fallback=llm_response.used_fallback
        )

        if request.channel == "email":
            subject, body = validate_email_output(llm_response.content)
            html_body = f"<p>{body.replace(chr(10), '<br>')}</p>"
            return GenerationResult(subject=subject, html_body=html_body, plain_body=body, metadata=metadata)
        elif request.channel == "sms":
            body = validate_sms_output(llm_response.content)
            return GenerationResult(subject=None, plain_body=body, metadata=metadata)
        elif request.channel == "whatsapp":
            body = validate_whatsapp_output(llm_response.content)
            return GenerationResult(subject=None, plain_body=body, metadata=metadata)

