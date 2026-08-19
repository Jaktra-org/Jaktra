from langchain_core.prompts import ChatPromptTemplate

PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You write concise SMS payment reminders under 160 characters. "
               "Include amount, due date, and payment link. Friendly tone. "
               "Analyze {client_name}: if it's an individual person, address as '{client_name}'; if it's a company, address as '{client_name} Team' or '{client_name}'."),
    ("human", "Invoice {invoice_no} for ${invoice_amount} was due {due_date}. "
              "Client: {client_name}. Payment link: {payment_link}. "
              "Write a single SMS reminder under 160 characters. Example format: "
              "Hi {client_name}, friendly reminder Invoice {invoice_no} for ${invoice_amount} was due {due_date}. Pay here: {payment_link}")
])
