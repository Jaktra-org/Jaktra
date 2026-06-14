from typing import TypedDict, Optional, Any, Dict
from langgraph.graph import StateGraph, END

from src.prompt_registry import registry
from src.llm_client import llm_client
from src.security import sanitize_input, validate_email_output, validate_sms_output, validate_whatsapp_output
from src.exceptions import LLMGenerationError, OutputValidationError, PromptInjectionDetectedError
from api.config import settings

class GenerationState(TypedDict):
    request: Any
    context_analysis: Optional[Dict]
    tone_params: Optional[Dict]
    raw_output: Optional[str]
    validated_content: Optional[Dict]
    retry_count: int
    error: Optional[str]

def assess_context_node(state: GenerationState):
    req = state["request"]
    if req.urgency_tier == "legal_escalation":
        return {"error": "TIER_NOT_AUTOMATABLE"}
        
    analysis = {
        "invoice_no": sanitize_input(req.invoice_no),
        "days_overdue": req.days_overdue,
        "amount": req.invoice_amount,
        "channel": req.channel
    }
    return {"context_analysis": analysis}

def select_tone_node(state: GenerationState):
    req = state["request"]
    try:
        prompt = registry.get_prompt(req.channel, req.urgency_tier)
    except Exception as e:
        return {"error": str(e)}
        
    return {"tone_params": {"prompt_template": prompt}}

async def compose_message_node(state: GenerationState):
    req = state["request"]
    prompt = state["tone_params"]["prompt_template"]
    
    sender_name = getattr(settings, "SMTP_SENDER_NAME", "Finance Department")
    payment_link = getattr(req, "payment_link", None) or getattr(settings, "PAYMENT_LINK", "")
    bank_details = getattr(req, "bank_details", None) or getattr(settings, "BANK_DETAILS", "")

    format_instruction = ""
    if req.channel == "email":
        format_instruction = (
            "\nRespond with ONLY the email in this exact format — no extra commentary:\n"
            "\nSubject: <subject line>\n\nBody:\n<email body>"
        )

    messages = prompt.format_messages(
        client_name=sanitize_input(getattr(req, "client_name", "")),
        invoice_no=sanitize_input(getattr(req, "invoice_no", "")),
        invoice_amount=sanitize_input(str(getattr(req, "invoice_amount", ""))),
        due_date=sanitize_input(str(getattr(req, "due_date", ""))[:10]),
        days_overdue=getattr(req, "days_overdue", 0),
        followup_count=getattr(req, "followup_count", 0),
        sender_name=sender_name,
        payment_link=payment_link,
        bank_details=bank_details,
        format_instruction=format_instruction
    )
    
    try:
        llm_response = await llm_client.generate(messages, temperature=settings.LLM_TEMPERATURE)
        return {"raw_output": llm_response.content}
    except LLMGenerationError as exc:
        return {"error": str(exc)}

def validate_output_node(state: GenerationState):
    req = state["request"]
    raw_output = state.get("raw_output")
    
    if not raw_output:
        return {"error": "No output generated to validate"}

    try:
        if req.channel == "email":
            subject, body = validate_email_output(raw_output)
            html_body = f"<p>{body.replace(chr(10), '<br>')}</p>"
            validated = {"subject": subject, "plain_body": body, "html_body": html_body}
        elif req.channel == "sms":
            body = validate_sms_output(raw_output)
            validated = {"subject": None, "plain_body": body, "html_body": None}
        elif req.channel == "whatsapp":
            body = validate_whatsapp_output(raw_output)
            validated = {"subject": None, "plain_body": body, "html_body": None}
        else:
            return {"error": "UNSUPPORTED_CHANNEL"}
            
        return {"validated_content": validated, "error": None}
    except (OutputValidationError, PromptInjectionDetectedError) as e:
        return {"error": str(e), "retry_count": state.get("retry_count", 0) + 1}

def format_response_node(state: GenerationState):
    pass

def format_error_response(state: GenerationState):
    pass

def route_after_assess(state: GenerationState):
    if state.get("error"):
        return "halt"
    return "select_tone"

def route_after_select_tone(state: GenerationState):
    if state.get("error"):
        return "format_error_response"
    return "compose_message"

def should_retry_or_finish(state: GenerationState):
    if state.get("error"):
        if state.get("retry_count", 0) <= 1:
            return "retry"
        return "fail"
    return "success"

graph = StateGraph(GenerationState)

graph.add_node("assess_context", assess_context_node)
graph.add_node("select_tone", select_tone_node)
graph.add_node("compose_message", compose_message_node)
graph.add_node("validate_output", validate_output_node)
graph.add_node("format_response", format_response_node)
graph.add_node("format_error_response", format_error_response)

graph.add_conditional_edges("assess_context", route_after_assess, {
    "select_tone": "select_tone",
    "halt": "format_error_response"
})

graph.add_conditional_edges("select_tone", route_after_select_tone, {
    "compose_message": "compose_message",
    "format_error_response": "format_error_response"
})

graph.add_edge("compose_message", "validate_output")

graph.add_conditional_edges("validate_output", should_retry_or_finish, {
    "success": "format_response",
    "retry": "compose_message",
    "fail": "format_error_response"
})

graph.add_edge("format_response", END)
graph.add_edge("format_error_response", END)

graph.set_entry_point("assess_context")
supervisor = graph.compile()
