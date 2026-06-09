import { Router, RequestHandler } from 'express';
import { AimlController } from './aiml.controller.js';

export function createAimlRouter(
  aimlController: AimlController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.get(
    '/health',
    authMiddleware,
    aimlController.getHealth,
  );

  return router;
}

