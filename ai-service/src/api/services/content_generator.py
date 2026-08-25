from pydantic import BaseModel
from typing import Optional
import re
from src.prompt_registry import PromptRegistry, TierNotAutomatableError, UnknownPromptError
from src.llm_client import LLMClient
from src.security import sanitize_input, validate_email_output, validate_sms_output, validate_whatsapp_output
from src.exceptions import LLMGenerationError, OutputValidationError
from src.api.config import settings
from src.api.logging import logger


class GenerationResult(BaseModel):
    subject: Optional[str] = None
    html_body: Optional[str] = None
    plain_body: Optional[str] = None
    metadata: dict


# ─── Currency formatting ───────────────────────────────────────────────────────

_CURRENCY_SYMBOLS = {
    "INR": "₹", "USD": "$", "EUR": "€", "GBP": "£",
    "AUD": "A$", "CAD": "C$", "SGD": "S$", "AED": "AED ",
    "JPY": "¥", "CNY": "¥",
}


def _currency_prefix(currency: str) -> str:
    """Return a clean currency prefix (symbol or 3-letter code + space)."""
    c = (currency or "INR").strip().upper()
    return _CURRENCY_SYMBOLS.get(c, f"{c} ")


from datetime import datetime


def _format_human_date(due_date_str: str) -> str:
    """Format ISO YYYY-MM-DD into human-friendly 'August 20, 2026'."""
    clean_date = (due_date_str or "").strip()[:10]
    if not clean_date:
        return "the scheduled due date"
    try:
        dt = datetime.strptime(clean_date, "%Y-%m-%d")
        return dt.strftime("%B %d, %Y").replace(" 0", " ")
    except Exception:
        return clean_date


def _format_amount(amount_str: str) -> str:
    """Format numeric string into clean comma-separated amount (e.g. 5700 -> 5,700)."""
    clean = str(amount_str or "0").strip().replace(",", "")
    try:
        val = float(clean)
        if val.is_integer():
            return f"{int(val):,}"
        return f"{val:,.2f}"
    except Exception:
        return str(amount_str or "0")


# ─── Context builders ─────────────────────────────────────────────────────────

def _format_recipient_display(client_name: str, company_name: str) -> str:
    """
    Format recipient display string taking into account individual vs company context.
    """
    c_name = (client_name or "").strip()
    co_name = (company_name or "").strip()

    if c_name and co_name and c_name.lower() != co_name.lower() and c_name.lower() != "valued customer":
        return f"{c_name} ({co_name})"
    if c_name and c_name.lower() != "valued customer":
        return c_name
    if co_name:
        return co_name
    return c_name or "Valued Customer"


def _build_cta_block(payment_link: str, bank_details: str) -> str:
    """
    Build the portal/payment CTA section for the prompt from what is actually available.
    Directs the client to access their invoice portal to view details and settle online.
    """
    if payment_link:
        return f"Portal Action:\nDirect the client to access their online invoice portal to review details and complete payment:\n{payment_link}"
    if bank_details:
        return f"Bank Transfer Action:\nDirect the client to remit payment via direct bank transfer:\n{bank_details}"
    return "Action:\nRequest the recipient to reply to this email to arrange payment or confirm their schedule."


def _build_subject_context_inline(
    invoice_subject: Optional[str],
    inst_num: Optional[int],
    total_inst: Optional[int],
) -> str:
    """
    Build inline subject context for SMS/WhatsApp or legacy references.
    """
    parts = []
    if invoice_subject and str(invoice_subject).strip():
        desc = sanitize_input(str(invoice_subject).strip())
        parts.append(f" - {desc}")
    if inst_num and total_inst:
        parts.append(f" [Installment #{inst_num} of {total_inst}]")
    return "".join(parts)


# ─── HTML conversion ──────────────────────────────────────────────────────────

def _plain_to_html(plain_body: str, sender_name: str, subject: str) -> str:
    """
    Convert LLM plain-text output into a styled HTML email.
    Blank-line-separated paragraphs become <p> blocks.
    The email header uses the AI-generated subject.
    Cleans trailing punctuation (dots, commas) off URL hrefs.
    """
    def _link_replacer(match):
        raw_url = match.group(1)
        trailing = ""
        while raw_url and raw_url[-1] in ".,;:)!]}>\"'":
            trailing = raw_url[-1] + trailing
            raw_url = raw_url[:-1]
        return f'<a href="{raw_url}" style="color: #2563eb; font-weight: 600; text-decoration: underline;">{raw_url}</a>{trailing}'

    paragraphs = [p.strip() for p in plain_body.split("\n\n") if p.strip()]
    
    html_paragraphs_list = []
    for para in paragraphs:
        escaped_para = para.replace("<", "&lt;").replace(">", "&gt;")
        linked_para = re.sub(
            r"(https?://[^\s\"'<>]+)",
            _link_replacer,
            escaped_para
        )
        formatted_block = linked_para.replace("\n", "<br>")
        html_paragraphs_list.append(
            f'    <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6; font-size: 15px;">{formatted_block}</p>'
        )

    html_paragraphs = "\n".join(html_paragraphs_list)
    display_title = subject[:90] + ("..." if len(subject) > 90 else "")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{display_title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 28px 40px;">
              <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600; letter-spacing: -0.3px;">
                {display_title}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 24px 40px;">
{html_paragraphs}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                This is an automated payment notification. If you have already made the payment, please disregard this notice.
                For questions or assistance, please contact {sender_name}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ─── Retry prompt ─────────────────────────────────────────────────────────────

def _build_retry_messages(
    original_content: str,
    failure_reason: str,
    payment_link: str,
    sender_name: str,
) -> list:
    """
    Build a surgical correction prompt for a single retry.
    Tells the model precisely what failed and must be fixed while preserving context and tone.
    """

    class _Msg:
        def __init__(self, type_str: str, content_str: str):
            self.type = type_str
            self.content = content_str

    system = (
        "You are an Accounts Receivable specialist correcting a payment reminder email that failed output validation.\n"
        "Fix ONLY the stated problem. Preserve the professional tone, greeting, and structure.\n"
        "Output ONLY the corrected email in this exact format:\n"
        "Subject: <subject line>\n\n"
        "Body:\n"
        "<complete email body>"
    )

    portal_instruction = ""
    if payment_link:
        portal_instruction = f"\nCRITICAL REQUIREMENT: The email MUST include this payment link URL naturally in the Call to Action:\n{payment_link}"

    user = (
        f"The previous draft failed validation. Reason: {failure_reason}{portal_instruction}\n\n"
        f"Original draft:\n---\n{original_content}\n---\n\n"
        f"Produce the complete, corrected email now. Sign off as: {sender_name}"
    )

    return [_Msg("system", system), _Msg("user", user)]


# ─── Main generator ───────────────────────────────────────────────────────────

class ContentGenerator:
    def __init__(self, prompt_registry: PromptRegistry, llm_client: LLMClient):
        self.prompts = prompt_registry
        self.llm = llm_client

    async def generate(self, request) -> GenerationResult:
        if request.channel not in ["email", "sms", "whatsapp"]:
            raise ValueError(f"UNSUPPORTED_CHANNEL: {request.channel}")

        inst_num = getattr(request, "installment_number", None)
        total_inst = getattr(request, "total_installments", None)
        is_installment = bool(inst_num and total_inst)

        try:
            prompt = self.prompts.get_prompt(request.channel, request.urgency_tier, is_installment=is_installment)
        except TierNotAutomatableError:
            raise ValueError(f"{request.urgency_tier} does not have an automated prompt.")
        except UnknownPromptError as e:
            raise ValueError(str(e))

        # Sender name: prefer per-request value over global setting
        raw_sender = getattr(request, "sender_name", None)
        sender_name = sanitize_input(str(raw_sender).strip()) if raw_sender and str(raw_sender).strip() else getattr(settings, "SMTP_SENDER_NAME", "Finance Department")

        # Client and Company names
        raw_client = sanitize_input(getattr(request, "client_name", "") or "")
        raw_company = sanitize_input(getattr(request, "company_name", "") or "")
        recipient_display = _format_recipient_display(raw_client, raw_company)

        # Invoice description (what payment is for)
        raw_invoice_subject = getattr(request, "invoice_subject", None)
        if raw_invoice_subject and str(raw_invoice_subject).strip():
            raw_desc = sanitize_input(str(raw_invoice_subject).strip())
            # Clean up irregular spacing around punctuation (e.g. "Bat , Ball and Thigh Pad" -> "Bat, Ball and Thigh Pad")
            raw_desc = re.sub(r'\s+([,.:;])', r'\1', raw_desc)
            invoice_description = re.sub(r'\s+', ' ', raw_desc).strip()
        else:
            invoice_description = "Invoice settlement for professional goods/services"

        # Payment link and bank details
        payment_link = sanitize_input(getattr(request, "payment_link", None) or "")
        bank_details = sanitize_input(
            getattr(request, "bank_details", None) or getattr(settings, "BANK_DETAILS", "") or ""
        )

        # Currency prefix (e.g. "₹", "$")
        currency = _currency_prefix(getattr(request, "currency", None) or "INR")

        # Formatted amount & dates
        raw_amount = str(getattr(request, "invoice_amount", "") or "0.00")
        formatted_amount = _format_amount(raw_amount)
        raw_due_date = str(getattr(request, "due_date", "") or "")[:10]
        human_due_date = _format_human_date(raw_due_date)

        # Overdue context
        days_overdue = int(getattr(request, "days_overdue", 0) or 0)
        status_word = "Overdue" if days_overdue > 0 else "Due"
        if days_overdue > 0:
            overdue_phrase = f"{days_overdue} days overdue"
        elif days_overdue == 0:
            overdue_phrase = "due today"
        else:
            overdue_phrase = f"due in {abs(days_overdue)} days"

        # CTA block — built from what is actually available
        cta_block = _build_cta_block(payment_link, bank_details)

        # Inline subject context (for SMS/WhatsApp)
        subject_context_inline = _build_subject_context_inline(
            raw_invoice_subject,
            inst_num if is_installment else None,
            total_inst if is_installment else None,
        )

        # Build formatted messages
        messages = prompt.format_messages(
            client_name=raw_client or "Valued Customer",
            company_name=raw_company or "",
            recipient_display=recipient_display,
            invoice_no=sanitize_input(getattr(request, "invoice_no", "") or ""),
            invoice_description=invoice_description,
            invoice_amount=formatted_amount,
            formatted_amount=formatted_amount,
            due_date=human_due_date,
            human_due_date=human_due_date,
            raw_due_date=raw_due_date,
            days_overdue=days_overdue,
            overdue_phrase=overdue_phrase,
            status_word=status_word,
            followup_count=getattr(request, "followup_count", 0),
            sender_name=sender_name,
            currency=currency,
            cta_block=cta_block,
            subject_context_inline=subject_context_inline,
            payment_link=payment_link,
            installment_number=inst_num or 1,
            total_installments=total_inst or 1,
        )

        llm_response = await self.llm.generate(messages, temperature=settings.LLM_TEMPERATURE)

        metadata = {
            "tier_used": request.urgency_tier,
            "model": llm_response.model,
            "generation_ms": round(llm_response.generation_ms, 2),
            "token_count": llm_response.completion_tokens + llm_response.prompt_tokens,
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
            used_fallback=llm_response.used_fallback,
        )

        # Strip markdown code fences if model wraps output
        content = llm_response.content.strip()
        if content.startswith("```"):
            first_newline = content.find("\n")
            content = content[first_newline + 1:] if first_newline != -1 else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        # Clean subject boundary if present
        subject_match = re.search(r"(?m)^(?:\*{0,2})Subject:", content)
        if subject_match and subject_match.start() > 10:
            content = content[subject_match.start():]

        llm_response.content = content

        # ── Channel dispatch ──────────────────────────────────────────────────
        if request.channel == "email":
            return await self._finalize_email(
                request=request,
                llm_response=llm_response,
                payment_link=payment_link,
                sender_name=sender_name,
                recipient_display=recipient_display,
                invoice_description=invoice_description,
                currency=currency,
                bank_details=bank_details,
                metadata=metadata,
                inst_num=inst_num,
                total_inst=total_inst,
            )

        if request.channel == "sms":
            body = validate_sms_output(llm_response.content, payment_link)
            return GenerationResult(subject=None, plain_body=body, metadata=metadata)

        if request.channel == "whatsapp":
            body = validate_whatsapp_output(llm_response.content, payment_link)
            return GenerationResult(subject=None, plain_body=body, metadata=metadata)

    async def _finalize_email(
        self,
        request,
        llm_response,
        payment_link: str,
        sender_name: str,
        recipient_display: str,
        invoice_description: str,
        currency: str,
        bank_details: str,
        metadata: dict,
        inst_num: Optional[int],
        total_inst: Optional[int],
    ):
        """
        Validate and finalize the email.
        Performs one targeted retry if the first output fails validation.
        Falls back to a structured contextual template only as a last resort.
        """
        inv_no = sanitize_input(str(getattr(request, "invoice_no", "") or ""))
        inv_amount = sanitize_input(str(getattr(request, "invoice_amount", "") or "0.00"))
        due_date = sanitize_input(str(getattr(request, "due_date", "") or "")[:10])
        content = llm_response.content

        subject, body = await self._validate_with_retry(
            content=content,
            payment_link=payment_link,
            sender_name=sender_name,
            invoice_id=str(getattr(request, "invoice_id", "") or ""),
            inv_no=inv_no,
            inv_amount=inv_amount,
            currency=currency,
            due_date=due_date,
            recipient_display=recipient_display,
            invoice_description=invoice_description,
            bank_details=bank_details,
            inst_num=inst_num,
            total_inst=total_inst,
        )

        html_body = _plain_to_html(body, sender_name, subject)
        return GenerationResult(subject=subject, html_body=html_body, plain_body=body, metadata=metadata)

    async def _validate_with_retry(
        self,
        content: str,
        payment_link: str,
        sender_name: str,
        invoice_id: str,
        inv_no: str,
        inv_amount: str,
        currency: str,
        due_date: str,
        recipient_display: str,
        invoice_description: str,
        bank_details: str,
        inst_num: Optional[int],
        total_inst: Optional[int],
    ) -> tuple[str, str]:
        """
        Validate email content.
        On validation failure: attempt ONE surgical retry with targeted correction prompt.
        If retry also fails: use rich contextual fallback.
        """
        # First attempt
        first_failure_reason = ""
        try:
            return validate_email_output(content, payment_link)
        except OutputValidationError as first_err:
            first_failure_reason = str(first_err)
            logger.warning(
                "email_validation_first_attempt_failed",
                invoice_id=invoice_id,
                error=first_failure_reason,
                content_length=len(content),
            )

        # Single targeted retry — only if we have content to correct
        if content and len(content) >= 20:
            try:
                retry_messages = _build_retry_messages(
                    original_content=content,
                    failure_reason=first_failure_reason,
                    payment_link=payment_link,
                    sender_name=sender_name,
                )
                retry_response = await self.llm.generate(retry_messages, temperature=0.2)
                retry_content = retry_response.content.strip()
                if retry_content.startswith("```"):
                    nl = retry_content.find("\n")
                    retry_content = retry_content[nl + 1:] if nl != -1 else retry_content[3:]
                if retry_content.endswith("```"):
                    retry_content = retry_content[:-3]
                retry_content = retry_content.strip()

                subject, body = validate_email_output(retry_content, payment_link)
                logger.info("email_validation_retry_succeeded", invoice_id=invoice_id)
                return subject, body
            except (OutputValidationError, Exception) as retry_err:
                logger.warning(
                    "email_validation_retry_failed",
                    invoice_id=invoice_id,
                    error=str(retry_err),
                )

        # Last resort: rich structured fallback
        logger.warning("email_validation_using_structured_fallback", invoice_id=invoice_id)
        return self._structured_fallback(
            inv_no=inv_no,
            inv_amount=inv_amount,
            currency=currency,
            due_date=due_date,
            recipient_display=recipient_display,
            invoice_description=invoice_description,
            payment_link=payment_link,
            bank_details=bank_details,
            sender_name=sender_name,
            inst_num=inst_num,
            total_inst=total_inst,
        )

    def _structured_fallback(
        self,
        inv_no: str,
        inv_amount: str,
        currency: str,
        due_date: str,
        recipient_display: str,
        invoice_description: str,
        payment_link: str,
        bank_details: str,
        sender_name: str,
        inst_num: Optional[int] = None,
        total_inst: Optional[int] = None,
    ) -> tuple[str, str]:
        """
        Build a clean, direct, professional fallback email using all available facts.
        Completely free of filler/softening language.
        """
        is_installment = bool(inst_num and total_inst)
        human_due_date = _format_human_date(due_date)
        formatted_amount = _format_amount(inv_amount)

        if is_installment:
            subject = f"Payment Reminder: Installment #{inst_num} of {total_inst} – Invoice #{inv_no} – {currency}{formatted_amount} Due"
        else:
            subject = f"Payment Reminder: Invoice #{inv_no} – {invoice_description} – {currency}{formatted_amount} Overdue"

        # Salutation
        recip_clean = recipient_display.strip()
        lower_recip = recip_clean.lower()
        company_words = ["corp", "inc", "ltd", "llc", "pvt", "limited", "technologies", "services", "solutions", "group"]
        is_company = any(w in lower_recip for w in company_words)

        if is_company:
            greeting = f"Dear {recip_clean} Finance Team,"
        elif recip_clean and lower_recip != "valued customer":
            greeting = f"Dear {recip_clean},"
        else:
            greeting = "Dear Accounts Team,"

        # Body paragraphs
        if is_installment:
            p1 = (
                f"This is a reminder regarding your payment plan for Invoice #{inv_no} "
                f"({invoice_description}). Installment #{inst_num} of {total_inst}, totaling "
                f"{currency}{formatted_amount}, was due on {human_due_date}."
            )
        else:
            p1 = (
                f"Invoice #{inv_no} for {invoice_description}, totaling {currency}{formatted_amount}, "
                f"was due on {human_due_date}."
            )

        if payment_link:
            p2 = f"Please make the payment through our online payment portal:\n{payment_link}"
        elif bank_details:
            p2 = f"Please remit payment via direct bank transfer:\n{bank_details}"
        else:
            p2 = "Please reply directly to this email to arrange payment or confirm your payment schedule."

        p3 = (
            "If you have already made the payment, please disregard this reminder.\n\n"
            "If you have any questions or need assistance, please contact us."
        )

        signoff = f"Regards,\n{sender_name}"

        body = f"{greeting}\n\n{p1}\n\n{p2}\n\n{p3}\n\n{signoff}"
        return subject, body

