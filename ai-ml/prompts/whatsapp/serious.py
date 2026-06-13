from langchain_core.prompts import ChatPromptTemplate

PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You write WhatsApp payment reminders under 500 characters. "
               "Use *bold* for emphasis. Use line breaks for readability. "
               "Include the amount, due date, and payment link. The CTA must be on its own line. Serious tone, mention credit terms."),
    ("human", "Invoice {invoice_no} for ${invoice_amount} was due {due_date} ({days_overdue} days overdue). "
              "Client: {client_name}. Payment link: {payment_link}. "
              "Write a single WhatsApp reminder under 500 characters. Example format:\n"
              "*URGENT: Outstanding Payment*\n\n"
              "Dear {client_name},\n"
              "*Invoice {invoice_no}* (*${invoice_amount}*) is *{days_overdue} days past due*. Continued non-payment may affect your credit terms.\n\n"
              "Please process payment immediately:\n{payment_link}")
])
