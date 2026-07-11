import { Router, RequestHandler } from 'express';
import { AuthController } from './auth.controller.js';

export function createAuthRouter(
  authController: AuthController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.post('/onboard', authController.onboard);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refresh);

  router.post('/mfa/verify', authController.mfaVerify);

  router.get('/me', authMiddleware, authController.getMe);
  router.patch('/profile', authMiddleware, authController.updateProfile);

  router.post('/mfa/setup', authMiddleware, authController.mfaSetupInitiate);
  router.post('/mfa/confirm', authMiddleware, authController.mfaSetupConfirm);
  router.delete('/mfa', authMiddleware, authController.mfaDisable);

  return router;
}
