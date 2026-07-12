import { Router } from 'express';
import express from 'express';
import multer from 'multer';
import { WebhookController } from './webhook.controller.js';

export function createWebhookRouter(
  webhookController: WebhookController
): Router {
  const router = Router();

  router.post(
    '/sendgrid',
    express.raw({ type: 'application/json' }),
    webhookController.handleSendgrid
  );

  const upload = multer();
  router.post(
    '/sendgrid/inbound/:secretToken',
    upload.any(),
    webhookController.handleSendgridInbound
  );

  // Payment Gateways
  router.post(
    '/payments/:webhookToken/:provider',
    express.raw({ type: 'application/json', limit: '2mb' }),
    webhookController.handlePayment
  );

  return router;
}
