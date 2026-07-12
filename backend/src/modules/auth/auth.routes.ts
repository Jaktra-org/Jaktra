import { Router, RequestHandler } from 'express';
import { AuthController } from './auth.controller.js';

export function createAuthRouter(
  authController: AuthController,
  authMiddleware: RequestHandler,
): Router {
  const router = Router();

  router.post('/onboard', authController.onboard);
  // @deprecated Use /register instead. Kept for backward compatibility.
  router.post('/register', authController.onboard);
  router.post('/verify-email', authController.verifyEmail);
  router.post('/resend-verification', authController.resendVerification);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refresh);

  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password/verify', authController.resetPasswordVerify);
  router.post('/reset-password/confirm', authController.resetPasswordConfirm);
  router.post('/reset-password/resend', authController.resetPasswordResend);

  router.post('/mfa/verify', authController.mfaVerify);


  router.get('/me', authMiddleware, authController.getMe);
  router.patch('/profile', authMiddleware, authController.updateProfile);

  router.post('/mfa/setup', authMiddleware, authController.mfaSetupInitiate);
  router.post('/mfa/confirm', authMiddleware, authController.mfaSetupConfirm);
  router.delete('/mfa', authMiddleware, authController.mfaDisable);

  return router;
}
