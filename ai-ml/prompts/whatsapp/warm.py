from langchain_core.prompts import ChatPromptTemplate

PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You write WhatsApp payment reminders under 500 characters. "
               "Use *bold* for emphasis. Use line breaks for readability. "
               "Include the amount, due date, and payment link. The CTA must be on its own line. Friendly tone."),
    ("human", "Invoice {invoice_no} for ${invoice_amount} was due {due_date}. "
              "Client: {client_name}. Payment link: {payment_link}. "
              "Write a single WhatsApp reminder under 500 characters. Example format:\n"
              "Hi {client_name},\n\n"
              "This is a friendly reminder that *Invoice {invoice_no}* for *${invoice_amount}* was due on {due_date}.\n\n"
              "You can easily pay using this link:\n{payment_link}")
])
