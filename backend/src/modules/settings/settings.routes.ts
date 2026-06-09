import { Router, RequestHandler } from 'express';
import { SettingsController } from './settings.controller.js';

export function createSettingsRouter(
  settingsController: SettingsController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware, tenantScoped);

  router.get('/', settingsController.getSettings);
  router.patch('/', settingsController.updateSettings);
  router.get('/integrations', settingsController.getIntegrations);

  return router;
}
