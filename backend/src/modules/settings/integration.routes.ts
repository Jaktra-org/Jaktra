import { Router } from 'express';
import { IntegrationController } from './integration.controller.js';
import { tenantScoped } from '../../middleware/tenant-scoped.js';

import { requireRole } from '../../middleware/require-role.js';

export function createIntegrationRouter(controller: IntegrationController): Router {
  const router = Router();

  router.use(tenantScoped);

  router.get('/', requireRole('admin', 'manager'), controller.getStatus);
  router.get('/sendgrid/health', requireRole('admin'), controller.getSendgridHealth);
  router.get('/resend/health', requireRole('admin'), controller.getResendHealth);
  
  router.post('/sendgrid', requireRole('admin'), controller.saveSendgridKey);
  router.post('/sendgrid/test', requireRole('admin'), controller.testSendgridKey);
  router.delete('/sendgrid', requireRole('admin'), controller.disconnectSendgrid);
  router.post('/sendgrid/reply-mode', requireRole('admin'), controller.setReplyMode);
  router.post('/sendgrid/reply-mailbox/send-otp', requireRole('admin'), controller.sendReplyMailboxOtp);
  router.post('/sendgrid/reply-mailbox/verify-otp', requireRole('admin'), controller.verifyReplyMailboxOtp);
  router.post('/sendgrid/inbound/verify', requireRole('admin'), controller.verifyInboundParse);

  router.post('/smtp', requireRole('admin'), controller.saveSmtpConfig);
  router.post('/smtp/test', requireRole('admin'), controller.testSmtpConfig);
  router.delete('/smtp', requireRole('admin'), controller.disconnectSmtp);

  router.post('/resend', requireRole('admin'), controller.saveResendKey);
  router.post('/resend/test', requireRole('admin'), controller.testResendKey);
  router.delete('/resend', requireRole('admin'), controller.disconnectResend);
  router.post('/resend/reply-mode', requireRole('admin'), controller.setResendReplyMode);
  router.post('/resend/reply-mailbox/send-otp', requireRole('admin'), controller.sendResendReplyMailboxOtp);
  router.post('/resend/reply-mailbox/verify-otp', requireRole('admin'), controller.verifyResendReplyMailboxOtp);
  router.post('/resend/inbound/verify', requireRole('admin'), controller.verifyResendInboundParse);

  router.post('/:provider/activate', requireRole('admin'), controller.setActiveProvider);

  router.patch('/default-provider', requireRole('admin'), controller.setDefaultProvider);

  router.post('/razorpay', requireRole('admin'), controller.saveRazorpayKey);
  router.post('/razorpay/test', requireRole('admin'), controller.testRazorpayKey);
  router.delete('/razorpay', requireRole('admin'), controller.disconnectRazorpay);

  return router;
}
