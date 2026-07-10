export const ACTION_TYPES = [
  'invoice.created',
  'invoice.imported',   
  'invoice.updated',
  'invoice.status_changed',
  'invoice.deleted',
  'invoice.permanently_deleted',

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

  
  'user.invited',
  'user.invite_resent',
  'user.invite_revoked',
  'user.joined',
  'user.role_updated',
  'user.removed',

  'settings.updated',
  'settings.webhook_token_rotated',

  'integration.connected',
  'integration.disconnected',
  'integration.default_email_changed',

  'template.updated',

  'invoice.bulk_imported',
  'agent.run_triggered',
  'reconciler.run_triggered',

  'legacy.event',
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTIVITY_LOG_VISIBLE_ACTIONS: ActionType[] = [
  'user.invited',
  'user.invite_resent',
  'user.invite_revoked',
  'user.joined',
  'user.role_updated',
  'user.removed',

  'settings.updated',
  'settings.webhook_token_rotated',

  'integration.connected',
  'integration.disconnected',
  'integration.default_email_changed',

  'invoice.bulk_imported',
  'agent.run_triggered',
  'reconciler.run_triggered',

  'invoice.deleted',
  'dlq.cleared',
];
