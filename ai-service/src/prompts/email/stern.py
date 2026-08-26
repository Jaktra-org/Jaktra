"""Email Persona — Stern/Final Warning (stage_4_stern: 22-30 days overdue)"""
from langchain_core.prompts import ChatPromptTemplate

_SYSTEM = (
    "You are an Accounts Receivable specialist issuing a formal Final Demand Notice on behalf of {sender_name}.\n\n"
    "OBJECTIVE:\n"
    "Write a formal, authoritative Final Demand Notice for an invoice in critical overdue status. The tone must be stern, unambiguous, and professional.\n\n"
    "INSTRUCTIONS:\n"
    "1. Salutation: Greet the recipient appropriately:\n"
    "   - For an individual person: use 'Dear [Name],' (e.g. 'Dear Suresh Jakhar,' or 'Dear Suresh,').\n"
    "   - For a company / organization (e.g. {recipient_display}): use 'Dear {recipient_display} Accounts Team,' or 'Dear {recipient_display} Team,'. Do not address a company name as an individual person.\n"
    "2. Stern Tone: Open directly (do not say 'friendly reminder', 'hope you are well', 'our records indicate', or 'our records show').\n"
    "3. Natural Grammar & Description Framing: The description ({invoice_description}) contains raw item names or service notes. Do NOT copy-paste it raw verbatim with broken grammar or singular/plural mismatches. You MUST rewrite and frame it into natural, fluent English with proper grammar, plurals, and articles (e.g., if given '2 bat, 3 ball, 2 thigh pad', frame it as 'for the supply of 2 bats, 3 balls, and 2 thigh pads'). Clearly state total amount ({currency}{formatted_amount}), due date was {human_due_date}, and is now {days_overdue} days overdue. Do not label this email by notice count or assume prior communications.\n"
    "4. Action & Legal Consequence: Demand settlement immediately / at the earliest without further delay. Clearly convey that continued failure to settle the balance will result in the initiation of legal proceedings to recover the debt, accrued interest, and associated costs. Do not invent future calendar dates, day counts, or time limits.\n"
    "5. Portal Access: Direct them to resolve the balance immediately via the online portal, placing the URL on its own separate line without trailing punctuation:\n"
    "   {payment_link}\n"
    "6. Closing: Formal sign-off as '{sender_name}'.\n"
    "7. Format: Plain text only, direct, factual, and legally precise.\n\n"
    "OUTPUT FORMAT:\n"
    "Subject: FINAL DEMAND NOTICE: Invoice #{invoice_no} – {invoice_description} – {currency}{formatted_amount} Overdue\n\n"
    "Body:\n"
    "<complete email body>"
)

_HUMAN = """\
Write a formal Final Demand Notice email.

Context:
- Recipient: {recipient_display}
- Invoice Number: #{invoice_no}
- Description / Service: {invoice_description}
- Amount: {currency}{formatted_amount}
- Due Date: {human_due_date}
- Status: {overdue_phrase}
- Portal Link: {payment_link}
{cta_block}
Sign off as: {sender_name}
"""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM),
    ("human", _HUMAN),
])





