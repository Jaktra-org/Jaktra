import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { csvUpload } from '../../middleware/csv-upload.js';
import { InvoiceController } from './invoice.controller.js';
import { requireRole } from '../../middleware/require-role.js';
import { validateParam } from '../../middleware/validate-param.js';
import { ValidationError } from '../../shared/errors/index.js';

export function createInvoiceRouter(
  invoiceController: InvoiceController,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  router.use(authMiddleware);
  router.use(tenantScoped);

  router.post('/', requireRole('admin', 'manager'), invoiceController.create);
  router.post('/bulk', requireRole('admin', 'manager'), invoiceController.createBulk);
  router.get('/', invoiceController.list);

  router.post(
    '/import',
    requireRole('admin', 'manager'),
    (req: Request, res: Response, next: NextFunction) => {
      csvUpload(req, res, (err: unknown) => {
        if (err) {
          next(new ValidationError('CSV upload failed', err instanceof Error ? err.message : String(err)));
          return;
        }
        next();
      });
    },
    invoiceController.importFromCsv,
  );

  router.get('/trash', invoiceController.listTrashed);
  router.get('/:id/trashed', validateParam('id'), invoiceController.getTrashed);
  router.get('/:id', validateParam('id'), invoiceController.getById);
  router.patch('/:id', validateParam('id'), requireRole('admin', 'manager'), invoiceController.update);
  router.delete('/:id/permanent', validateParam('id'), requireRole('admin'), invoiceController.permanentDelete);
  router.delete('/:id', validateParam('id'), requireRole('admin', 'manager'), invoiceController.delete);
  router.patch('/:id/status', validateParam('id'), requireRole('admin', 'manager'), invoiceController.updateStatus);
  router.post('/:id/payment-link', validateParam('id'), requireRole('admin', 'manager'), invoiceController.generatePaymentLink);
  router.post('/:id/restore', validateParam('id'), requireRole('admin', 'manager'), invoiceController.restore);

  return router;
}

