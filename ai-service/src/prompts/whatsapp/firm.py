from langchain_core.prompts import ChatPromptTemplate

PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You write WhatsApp payment reminders under 500 characters. "
               "Use *bold* for emphasis. Use line breaks for readability. "
               "Include the amount, due date, and payment link. The CTA must be on its own line. Firm tone. "
               "Analyze {client_name}: if it's an individual person, greet with 'Hi {client_name},' or 'Dear {client_name},'; if it's a company or organization, greet with 'Dear {client_name} Accounts Team,' or 'Dear {client_name} Finance Team,'."),
    ("human", "Invoice {invoice_no} for ${invoice_amount} was due {due_date} ({days_overdue} days overdue). "
              "Client: {client_name}. Payment link: {payment_link}. "
              "Write a single WhatsApp reminder under 500 characters. Example format:\n"
              "Hi {client_name},\n\n"
              "Payment for *Invoice {invoice_no}* (*${invoice_amount}*) is currently *{days_overdue} days overdue*.\n\n"
              "Please confirm your payment date and pay via the link below:\n{payment_link}")
])
