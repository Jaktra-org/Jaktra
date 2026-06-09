import { Router, RequestHandler } from 'express';
import { TriageController } from './triage.controller.js';

export function createTriageRouter(
  triageController: TriageController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  router.get(
    '/triaged',
    authMiddleware,
    tenantScoped,
    triageController.getTriaged,
  );

  return router;
}

