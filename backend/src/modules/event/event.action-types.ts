export const ACTION_TYPES = [
  'invoice.created',
  'invoice.imported',   
  'invoice.updated',
  'invoice.status_changed',
  'invoice.deleted',

  'followup.triggered',   
  'followup.sent',        
  'followup.skipped',     
  'followup.halted',      
  'followup.email_opened',
  'followup.email_clicked',
  'followup.bounced',

  'payment.link_generated',
  'payment.received',

  'dlq.added',
  'dlq.cleared',
  'dlq.retried',

  'legacy.event',
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];
