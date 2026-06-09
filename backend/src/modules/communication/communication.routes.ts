import { Router, RequestHandler } from 'express';
import { CommunicationController } from './communication.controller.js';

export function createCommunicationRouter(
  communicationController: CommunicationController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  router.get(
    '/invoices/:id/communications',
    authMiddleware,
    tenantScoped,
    communicationController.listByInvoice,
  );

  router.post(
    '/communications',
    authMiddleware,
    tenantScoped,
    communicationController.create,
  );

  // --- Provider Settings ---

  router.get(
    '/settings/:channel',
    authMiddleware,
    tenantScoped,
    communicationController.getSettings,
  );

  router.post(
    '/settings/:channel',
    authMiddleware,
    tenantScoped,
    communicationController.updateSettings,
  );

  router.post(
    '/settings/:channel/test',
    authMiddleware,
    tenantScoped,
    communicationController.testCommunication,
  );

  return router;
}

