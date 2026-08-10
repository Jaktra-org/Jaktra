"""WhatsApp Persona — Payment Plan Installment Reminder"""
from langchain_core.prompts import ChatPromptTemplate

_SYSTEM_PERSONA = (
    "You write professional WhatsApp payment plan installment reminders for accounts receivable."
)

_HUMAN = """
Hi {client_name}, this is a reminder for Installment #{installment_number} of {total_installments} for Invoice #{invoice_no}.
Amount: {invoice_amount}
Due Date: {due_date}

Please pay using your secure link: {payment_link}
Thank you!
"""

PROMPT = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_PERSONA),
    ("human", _HUMAN),
])
