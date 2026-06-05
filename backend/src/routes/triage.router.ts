import { Router, Request, Response, RequestHandler } from 'express';
import type { TriageService } from '../services/triage.service.js';
import type { InvoiceRepository } from '../repositories/invoice.repository.js';

export function createTriageRouter(
  triageService: TriageService,
  invoiceRepo: InvoiceRepository,
  authMiddleware: RequestHandler,
  tenantScoped: RequestHandler,
): Router {
  const router = Router();

  router.get(
    '/triaged',
    authMiddleware,
    tenantScoped,
    async (_req: Request, res: Response) => {
      const tenantId = res.locals.tenantId as string;
      const allInvoices = await invoiceRepo.findByTenant(tenantId);
      const result = triageService.triageInvoices(allInvoices);

      const updatePromises = result.invoices.map((inv) =>
        invoiceRepo.updateUrgencyTier(inv.id, inv.computedTier),
      );
      await Promise.all(updatePromises);

      res.status(200).json(result);
    },
  );

  return router;
}
