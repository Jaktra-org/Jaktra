import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { csvUpload } from '../../middleware/csv-upload.js';
import { InvoiceController } from './invoice.controller.js';

export function createInvoiceRouter(
  invoiceController: InvoiceController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  // Middleware for all invoice routes
  router.use(authMiddleware);
  router.use(tenantScoped);

  router.post('/', invoiceController.create);
  router.post('/bulk', invoiceController.createBulk);
  router.get('/', invoiceController.list);

  router.post(
    '/import',
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

  router.get('/:id', invoiceController.getById);
  router.patch('/:id', invoiceController.update);
  router.delete('/:id', invoiceController.delete);
  router.patch('/:id/status', invoiceController.updateStatus);

  return router;
}

