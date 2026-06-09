import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { csvUpload } from '../../middleware/csv-upload.js';
import { InvoiceController } from './invoice.controller.js';

export function createInvoiceRouter(
  invoiceController: InvoiceController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  router.post(
    '/import',
    authMiddleware,
    tenantScoped,
    (req: Request, res: Response, next: NextFunction) => {
      csvUpload(req, res, (err: unknown) => {
        if (err instanceof Error) {
          res.status(400).json({ error: err.message });
          return;
        }
        next();
      });
    },
    invoiceController.importFromCsv,
  );

  return router;
}

