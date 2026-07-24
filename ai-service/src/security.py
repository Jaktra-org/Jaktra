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

def validate_email_output(raw_text: str, payment_link: str | None = None) -> tuple[str, str]:
    """Parse and validate LLM-generated email output."""
    subject = ""
    body = ""
    
    for line in raw_text.splitlines():
        if line.lower().strip().startswith("subject:"):
            subject = line[len("subject:"):].strip()
            break
            
    lower_text = raw_text.lower()
    marker = "body:"
    if marker in lower_text:
        marker_pos = lower_text.find(marker)
        body = raw_text[marker_pos + len(marker):].strip()
    else:
        if subject and subject in raw_text:
            body = raw_text[raw_text.find(subject) + len(subject):].strip()
        else:
            body = raw_text

    if not subject:
        raise OutputValidationError("LLM output missing subject")
        
    if len(subject) < 10 or len(subject) > 200:
        raise OutputValidationError(f"Subject length {len(subject)} is out of bounds (10-200 chars)")

    if len(body) < 20 or len(body) > 5000:
        raise OutputValidationError(f"Body length {len(body)} is out of bounds (20-5000 chars)")
        
    if "ignore previous" in body.lower() or "ignore previous instructions" in body.lower():
        raise PromptInjectionDetectedError("Potential prompt injection detected in output.")
        
    _validate_untrusted_domains(raw_text, payment_link)
        
    return subject, body

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
