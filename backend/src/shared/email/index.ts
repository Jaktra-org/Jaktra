export interface EmailMessage {
  to: string;
  from: { name: string; email: string };
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  trackingSettings?: { openTracking?: boolean; clickTracking?: boolean };
}

export interface EmailSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

export type ResolvedEmailConfig =
  | { kind: 'smtp'; host: string; port: number; user: string; password: string; secure: boolean }
  | { kind: 'sendgrid'; apiKey: string };
