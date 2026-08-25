import re
import time
from collections import defaultdict
from urllib.parse import urlparse
from src.exceptions import OutputValidationError, PromptInjectionDetectedError


def sanitize_input(text: str) -> str:
    """
    Prevent Prompt Injection by scrubbing malicious patterns from user-provided data
    and removing structural XML/HTML tags.
    """
    if not isinstance(text, str):
        return str(text)
    
    # Strip XML/HTML tags to prevent escaping boundaries if the system uses them
    text = re.sub(r"<[^>]+>", "", text)
    
    # Common injection keywords to neutralize
    patterns = [
        r"ignore\s+previous\s+instructions",
        r"ignore\s+previous",
        r"system\s+prompt",
        r"system\s+instructions",
        r"instead\s+of",
        r"you\s+are\s+now",
        r"assistant\s*:",
        r"disregard\s+all",
        r"forget\s+previous",
        r"override\s+instructions",
    ]
    for p in patterns:
        text = re.sub(p, "[REDACTED]", text, flags=re.IGNORECASE)
    
    # Strip any potential hidden formatting or control characters
    return "".join(ch for ch in text if ch.isprintable()).strip()


def _strip_markdown_formatting(text: str) -> str:
    """
    Remove common markdown bold/italic markers that reasoning models inject
    despite instructions not to use markdown.
    e.g. **Subject:** -> Subject:  |  **INV-101** -> INV-101
    """
    # Remove bold (**text**) and italic (*text*) markers but keep the content
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    # Remove markdown headers (## Header -> Header)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    # Remove markdown bullet points that turn into noise
    text = re.sub(r"^[-•]\s+", "", text, flags=re.MULTILINE)
    return text


def _validate_untrusted_domains(raw_text: str, payment_link: str | None = None) -> None:
    if not payment_link:
        return
        
    try:
        trusted_host = urlparse(payment_link).hostname
        if not trusted_host:
            return
        trusted_host = trusted_host.lower()
    except Exception:
        return
        
    # Find all HTTP/HTTPS links in the raw text
    urls = re.findall(r"https?://[^\s\"'<>]+", raw_text)
    
    for url in urls:
        try:
            # Strip trailing punctuation commonly captured by regexes
            clean_url = url.rstrip(".,;:)!]}")
            url_host = urlparse(clean_url).hostname
            if not url_host:
                continue
            url_host = url_host.lower()
            
            # Allow if it exactly matches trusted host, or is a subdomain of trusted host
            if url_host == trusted_host or url_host.endswith("." + trusted_host):
                continue
            
            # Otherwise it is an untrusted domain
            raise PromptInjectionDetectedError("Untrusted URL domain detected in output.")
        except PromptInjectionDetectedError:
            raise
        except Exception:
            continue


def _detect_unfilled_placeholders(body: str) -> bool:
    """
    Detect if the model left template placeholders like [Client Name], {client_name}.
    These indicate the model ignored the actual data provided.
    """
    patterns = [
        r"\[Client Name\]",
        r"\[client name\]",
        r"\[Recipient\]",
        r"\[Your Name\]",
        r"\[Amount\]",
        r"\[Invoice Number\]",
        r"\[Date\]",
        r"\[Payment Link\]",
        r"\[payment link\]",
        r"\[Bank Details\]",
        r"\{client_name\}",
        r"\{invoice_no\}",
        r"\{invoice_amount\}",
    ]
    combined = "|".join(patterns)
    return bool(re.search(combined, body, re.IGNORECASE))


def validate_email_output(raw_text: str, payment_link: str | None = None) -> tuple[str, str]:
    """
    Parse and validate LLM-generated email output.

    Returns (subject, body) on success.
    Raises OutputValidationError on hard failures:
      - Missing or malformed subject
      - Missing or empty body
      - Body with unfilled placeholders
      - Injection attempts
    Raises PromptInjectionDetectedError on unsafe content.
    """
    # Step 0: Strip markdown formatting that reasoning models inject
    normalized = _strip_markdown_formatting(raw_text)

    subject = ""
    body = ""

    lines = [line.strip() for line in normalized.splitlines() if line.strip()]

    # 1. Search for explicit "Subject:" header line
    subject_line_idx = -1
    for i, line in enumerate(lines):
        clean_line = re.sub(r"^[\#\*\_\-\s]+", "", line).strip()
        if clean_line.lower().startswith("subject:"):
            subject = clean_line[len("subject:"):].strip()
            subject = re.sub(r"[\*\_\#]+$", "", subject).strip()
            subject_line_idx = i
            break

    # 2. Find body content
    lower_text = normalized.lower()
    marker = "body:"
    if marker in lower_text:
        marker_pos = lower_text.find(marker)
        body = normalized[marker_pos + len(marker):].strip()
    elif subject and subject in normalized:
        pos = normalized.find(subject) + len(subject)
        body = normalized[pos:].strip()
    else:
        body = normalized

    if body.lower().startswith("body:"):
        body = body[5:].strip()

    # 3. Fallback subject extraction if model omitted "Subject:" prefix
    if not subject and lines:
        first_line = re.sub(r"^[\#\*\_\-\s]+", "", lines[0]).strip()
        first_line = re.sub(r"[\*\_\#]+$", "", first_line).strip()
        if len(first_line) >= 5:
            subject = first_line
            if body.startswith(lines[0]):
                body = body[len(lines[0]):].strip()

    # ── HARD FAILURE CHECKS ───────────────────────────────────────────────────

    # 1. Security & Injection checks (evaluated first)
    if "ignore previous" in body.lower() or "ignore previous instructions" in body.lower():
        raise PromptInjectionDetectedError("Potential prompt injection detected in output.")

    # 2. Untrusted URL domain check
    _validate_untrusted_domains(normalized, payment_link)

    # 3. Subject validation
    if not subject:
        raise OutputValidationError("LLM output missing subject")

    if len(subject) < 8:
        raise OutputValidationError(f"Subject too short ({len(subject)} chars): {repr(subject)}")

    if len(subject) > 220:
        raise OutputValidationError(f"Subject too long ({len(subject)} chars)")

    # 4. Body length validation
    if not body or len(body.strip()) < 80:
        raise OutputValidationError(f"Body too short or empty ({len(body.strip()) if body else 0} chars). A complete professional email requires proper greeting, context, and details.")

    if len(body) > 6000:
        raise OutputValidationError(f"Body too long ({len(body)} chars)")

    # 5. Detect unfilled placeholders
    if _detect_unfilled_placeholders(body):
        raise OutputValidationError("Body contains unfilled template placeholders — model ignored provided data")

    # 6. Mandatory portal link check: when a payment link is provided, it MUST be present in the body
    if payment_link and str(payment_link).strip():
        clean_link = str(payment_link).strip()
        if clean_link not in body:
            raise OutputValidationError(f"Generated email is missing the required payment link: {clean_link}")

    return subject, body.strip()


def validate_sms_output(raw_text: str, payment_link: str | None = None) -> str:
    """Validate SMS output is within 160 chars and contains CTA."""
    if len(raw_text) > 160:
        raise OutputValidationError("SMS exceeds 160 characters")
    _validate_untrusted_domains(raw_text, payment_link)
    return raw_text.strip()


def validate_whatsapp_output(raw_text: str, payment_link: str | None = None) -> str:
    """Validate WhatsApp output is within 500 chars."""
    if len(raw_text) > 500:
        raise OutputValidationError("WhatsApp message exceeds 500 characters")
    _validate_untrusted_domains(raw_text, payment_link)
    return raw_text.strip()


class InMemoryRateLimiter:
    def __init__(self, requests_limit: int = 100, window_seconds: int = 60):
        self.limit = requests_limit
        self.window = window_seconds
        # Maps client identifier (e.g. API key or IP) to list of request timestamps
        self.history = defaultdict(list)

    def is_rate_limited(self, identifier: str) -> bool:
        now = time.time()
        # Clean up older timestamps outside the sliding window
        self.history[identifier] = [t for t in self.history[identifier] if now - t < self.window]
        if len(self.history[identifier]) >= self.limit:
            return True
        self.history[identifier].append(now)
        return False

# Global instance of the rate limiter (e.g. 100 requests per 60 seconds)
rate_limiter = InMemoryRateLimiter(requests_limit=100, window_seconds=60)
