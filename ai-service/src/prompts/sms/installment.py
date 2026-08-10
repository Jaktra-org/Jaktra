"""SMS Persona — Payment Plan Installment Reminder"""
from langchain_core.prompts import ChatPromptTemplate

_SYSTEM_PERSONA = (
    "You write concise payment plan installment reminder SMS messages for debt collection."
    "Keep it under 160 characters."
)

_HUMAN = """
Remind {client_name} about Installment #{installment_number} of {total_installments} for Invoice #{invoice_no} ({invoice_amount}), due on {due_date}.
Link: {payment_link}
"""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_PERSONA),
    ("human", _HUMAN),
])
