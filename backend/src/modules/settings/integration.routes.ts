import { Router } from 'express';
import { IntegrationController } from './integration.controller.js';
import { tenantScoped } from '../../middleware/tenant-scoped.js';

export function createIntegrationRouter(controller: IntegrationController): Router {
  const router = Router();

  // Authentication is assumed to be handled before this router is mounted
  router.use(tenantScoped);

  router.get('/', controller.getStatus);
  router.post('/sendgrid', controller.saveSendgridKey);
  router.post('/sendgrid/test', controller.testSendgridKey);
  router.delete('/sendgrid', controller.disconnectSendgrid);

  return router;
}
