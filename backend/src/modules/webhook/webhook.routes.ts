import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import { SendgridWebhookController } from './sendgrid-webhook.controller.js';
import { PaymentWebhookController } from './payment-webhook.controller.js';

export function createWebhookRouter(
  sendgridController: SendgridWebhookController,
  paymentController: PaymentWebhookController
): Router {
  const router = Router();

  router.post(
    '/sendgrid',
    express.raw({ type: 'application/json' }),
    sendgridController.handleSendgrid
  );

  const upload = multer();
  router.post(
    '/sendgrid/inbound/:secretToken',
    upload.any(),
    sendgridController.handleSendgridInbound
  );

  // Payment Gateways
  router.post(
    '/payments/:webhookToken/:provider',
    express.raw({ type: 'application/json', limit: '2mb' }),
    paymentController.handlePayment
  );

  return router;
}
