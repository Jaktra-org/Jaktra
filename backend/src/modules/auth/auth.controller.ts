import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthService } from './auth.service.js';
import { AuthError, ValidationError } from '../../shared/errors/index.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';


const onboardSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

const mfaVerifySchema = z.object({
  mfaPendingToken: z.string().min(1),
  code: z.string().min(1),
});

const mfaConfirmSchema = z.object({
  code: z.string().length(6),
});

const mfaDisableSchema = z.object({
  code: z.string().length(6),
});

export class AuthController {
  constructor(private authService: AuthService) {}


  onboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = onboardSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const result = await this.authService.onboard(parsed.data);
      res.status(201).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const result = await this.authService.login(parsed.data);
      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      next(new AuthError('Missing or malformed Authorization header', 401));
      return;
    }

    try {
      const result = await this.authService.refreshToken(header.slice(7));
      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const profile = await this.authService.getProfile(userId);
      res.status(200).json(profile);
    } catch (err: unknown) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const updatedUser = await this.authService.updateProfile(userId, parsed.data);
      res.status(200).json(updatedUser);
    } catch (err: unknown) {
      next(err);
    }
  };


  mfaVerify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = mfaVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const result = await this.authService.verifyMfaCode(
        parsed.data.mfaPendingToken,
        parsed.data.code,
      );
      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  mfaSetupInitiate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const result = await this.authService.initiateMfaSetup(userId);
      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  mfaSetupConfirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = mfaConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const result = await this.authService.confirmMfaSetup(userId, parsed.data.code);
      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  mfaDisable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const parsed = mfaDisableSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
      return;
    }

    try {
      const { userId } = (req as AuthenticatedRequest).user;
      await this.authService.disableMfa(userId, parsed.data.code);
      res.status(204).send();
    } catch (err: unknown) {
      next(err);
    }
  };
}
