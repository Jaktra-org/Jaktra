import { Router } from 'express';
import { HealthController } from './health.controller.js';

export function createHealthRouter(healthController: HealthController): Router {
  const router = Router();
  router.get('/', healthController.getHealth);
  return router;
}
