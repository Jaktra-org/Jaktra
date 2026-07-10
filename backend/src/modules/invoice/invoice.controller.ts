import { Request, Response, NextFunction } from 'express';
import type { InvoiceImportService, DuplicateStrategy } from './invoice.service.js';
import type { InvoiceRepository } from './invoice.repository.js';
import { logger } from '../../shared/logger.js';
import { TriageService } from '../agent/triage.service.js';
import {
  createInvoiceSchema,
  bulkCreateInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  listInvoicesSchema,
} from './invoice.schema.js';
import type { PaymentService } from '../payment/payment.service.js';
import { ValidationError, NotFoundError } from '../../shared/errors/index.js';
import type { EventService, ActorContext } from '../event/event.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';

export class InvoiceController {
  constructor(
    private importService: InvoiceImportService,
    private invoiceRepo: InvoiceRepository,
    private paymentService?: PaymentService,
    private eventService?: EventService
  ) {}

  private getActorContext(req: Request): ActorContext {
    const authReq = req as AuthenticatedRequest;
    return {
      source: 'ui',
      userId: authReq.user.userId,
      name: authReq.user.name,
      email: authReq.user.email,
      role: authReq.user.role,
    };
  }

  private areValuesEqual(key: string, val1: any, val2: any): boolean {
    if (val1 === val2) return true;
    if (val1 === null || val1 === undefined || val2 === null || val2 === undefined) {
      return val1 === val2;
    }

    if (key === 'invoiceAmount') {
      return Number(val1) === Number(val2);
    }

    if (key === 'dueDate') {
      const d1 = val1 instanceof Date ? val1 : new Date(val1);
      const d2 = val2 instanceof Date ? val2 : new Date(val2);
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        const toDateString = (d: Date) => d.toISOString().split('T')[0];
        try {
          return toDateString(d1) === toDateString(d2);
        } catch (e) {
          return d1.getTime() === d2.getTime();
        }
      }
    }

    return String(val1) === String(val2);
  }

  importFromCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        next(new ValidationError('No CSV file provided. Use field name "file".'));
        return;
      }

      const tenantId = res.locals.tenantId as string;
      const duplicateStrategy = (req.query.on_duplicate as DuplicateStrategy) || 'skip';

      if (!['skip', 'update'].includes(duplicateStrategy)) {
        next(new ValidationError('on_duplicate must be "skip" or "update"'));
        return;
      }

      logger.info(`File import started for tenant ${tenantId} (${req.file.originalname}, ${req.file.size} bytes)`);

      const actor = this.getActorContext(req);

      const result = await this.importService.importFromFile(
        req.file.buffer,
        req.file.originalname,
        tenantId,
        duplicateStrategy,
        actor
      );

      logger.info(`CSV import complete: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} errors`);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'invoice.bulk_imported',
        actor,
        metadata: {
          strategy: duplicateStrategy,
          imported: result.imported,
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors.length,
        },
      });

      res.status(200).json(result);
    } catch (err: unknown) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const data = createInvoiceSchema.parse(req.body);
      const actor = this.getActorContext(req);

      const result = await this.invoiceRepo.db.transaction(async (tx) => {
        const upsertResult = await this.invoiceRepo.upsertByInvoiceNo({
          ...data,
          invoiceAmount: data.invoiceAmount.toString(),
          tenantId
        }, tx);

        if (this.eventService) {
          if (upsertResult.wasUpdated) {
            await this.eventService.emitEvent('invoice', upsertResult.invoice.id, tenantId, 'invoice.updated', actor, {
              description: `Invoice #${upsertResult.invoice.invoiceNo} updated`,
              newValues: {
                clientName: upsertResult.invoice.clientName,
                invoiceAmount: upsertResult.invoice.invoiceAmount,
                dueDate: upsertResult.invoice.dueDate,
                contactEmail: upsertResult.invoice.contactEmail,
                paymentStatus: upsertResult.invoice.paymentStatus
              },
              tx
            });
          } else {
            await this.eventService.emitEvent('invoice', upsertResult.invoice.id, tenantId, 'invoice.created', actor, {
              description: `Invoice #${upsertResult.invoice.invoiceNo} created`,
              newValues: {
                invoiceNo: upsertResult.invoice.invoiceNo,
                clientName: upsertResult.invoice.clientName,
                invoiceAmount: upsertResult.invoice.invoiceAmount,
                dueDate: upsertResult.invoice.dueDate,
                contactEmail: upsertResult.invoice.contactEmail,
                paymentStatus: upsertResult.invoice.paymentStatus
              },
              tx
            });
          }
        }
        return upsertResult;
      });
      
      if (result.wasUpdated) {
        res.status(200).json(result.invoice);
      } else {
        res.status(201).json(result.invoice);
      }
    } catch (error: any) {
      next(error);
    }
  };

  createBulk = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const data = bulkCreateInvoiceSchema.parse(req.body);
      const actor = this.getActorContext(req);
      const invoicesToInsert = data.invoices.map(inv => ({
        ...inv,
        invoiceAmount: inv.invoiceAmount.toString(),
        tenantId
      }));

      const created = await this.invoiceRepo.db.transaction(async (tx) => {
        const results = await this.invoiceRepo.createMany(invoicesToInsert, tx);
        if (this.eventService) {
          for (const inv of results) {
            await this.eventService.emitEvent('invoice', inv.id, tenantId, 'invoice.created', actor, {
              description: `Invoice #${inv.invoiceNo} created`,
              newValues: {
                invoiceNo: inv.invoiceNo,
                clientName: inv.clientName,
                invoiceAmount: inv.invoiceAmount,
                dueDate: inv.dueDate,
                contactEmail: inv.contactEmail,
                paymentStatus: inv.paymentStatus
              },
              tx
            });
          }
        }
        return results;
      });

      res.status(201).json({ created: created.length, invoices: created });
    } catch (error: any) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const params = listInvoicesSchema.parse(req.query);
      
      const toArray = (val: string | string[] | undefined) => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : val.split(',');
      };

      const result = await this.invoiceRepo.findMany({
        tenantId,
        page: params.page,
        limit: params.limit,
        sortBy: params.sort_by as any,
        sortOrder: params.order,
        status: toArray(params.status),
        clientName: params.client_name,
        daysOverdueMin: params.days_overdue_min,
        daysOverdueMax: params.days_overdue_max,
      });

      const triageService = new TriageService();

      const dataWithDaysOverdue = result.data.map(inv => {
        const daysOverdue = triageService.computeDaysOverdue(inv.dueDate);
        const isActionable = triageService.isActionable(inv);
        let urgencyTier = null;
        if (isActionable) {
          urgencyTier = triageService.assignTier(daysOverdue);
        }
        return { 
          ...inv, 
          daysOverdue, 
          urgencyTier 
        };
      });

      res.status(200).json({
        data: dataWithDaysOverdue,
        pagination: {
          total: result.total,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(result.total / params.limit),
        }
      });
    } catch (error: any) {
      next(error);
    }
  };

  listTrashed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const params = listInvoicesSchema.parse(req.query);

      const toArray = (val: string | string[] | undefined) => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : val.split(',');
      };

      const result = await this.invoiceRepo.findTrashed({
        tenantId,
        page: params.page,
        limit: params.limit,
        sortBy: params.sort_by as any,
        sortOrder: params.order,
        clientName: params.client_name,
      });

      res.status(200).json({
        data: result.data,
        pagination: {
          total: result.total,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil(result.total / params.limit),
        }
      });
    } catch (error: any) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      
      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      const triageService = new TriageService();
      const daysOverdue = triageService.computeDaysOverdue(invoice.dueDate);
      const isActionable = triageService.isActionable(invoice);
      let urgencyTier = null;
      if (isActionable) {
        urgencyTier = triageService.assignTier(daysOverdue);
      }

      let paymentLink = null;
      let paymentWarning = null;
      try {
        if (this.paymentService) {
          paymentLink = await this.paymentService.getLatestPaymentLink(id, tenantId);
        }
      } catch (e: any) {
        logger.error('Failed to get payment link for invoice', { error: e });
        paymentWarning = 'Failed to fetch latest payment link status';
      }

      res.status(200).json({ 
        ...invoice, 
        daysOverdue,
        urgencyTier,
        paymentLink: paymentLink ? {
          url: paymentLink.paymentUrl,
          status: paymentLink.status,
        } : null,
        warning: paymentWarning
      });
    } catch (error: any) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const data = updateInvoiceSchema.parse(req.body);
      const actor = this.getActorContext(req);

      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      const updatedData: any = { ...data };
      if (data.invoiceAmount !== undefined) {
        updatedData.invoiceAmount = data.invoiceAmount.toString();
      }

      const oldValues: Record<string, any> = {};
      const newValues: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          const oldVal = (invoice as any)[key];
          const newVal = value;
          if (!this.areValuesEqual(key, oldVal, newVal)) {
            oldValues[key] = oldVal;
            newValues[key] = newVal;
          }
        }
      }

      const updated = await this.invoiceRepo.db.transaction(async (tx) => {
        const updateResult = await this.invoiceRepo.update(id, tenantId, updatedData, tx);
        if (!updateResult) {
          throw new NotFoundError('Invoice not found');
        }

        if (this.eventService && Object.keys(newValues).length > 0) {
          await this.eventService.emitEvent('invoice', id, tenantId, 'invoice.updated', actor, {
            description: `Invoice #${invoice.invoiceNo} updated`,
            oldValues,
            newValues,
            tx
          });
        }
        return updateResult;
      });
      
      if (
        this.paymentService &&
        data.invoiceAmount !== undefined &&
        Number(data.invoiceAmount) !== Number(invoice.invoiceAmount)
      ) {
        await this.paymentService.cancelActivePaymentLinks(tenantId, id);
      }

      res.status(200).json(updated);
    } catch (error: any) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const { paymentStatus } = updateInvoiceStatusSchema.parse(req.body);
      const actor = this.getActorContext(req);

      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      await this.invoiceRepo.db.transaction(async (tx) => {
        await this.invoiceRepo.updatePaymentStatus(id, paymentStatus as any, undefined, tx);
        if (this.eventService && invoice.paymentStatus !== paymentStatus) {
          await this.eventService.emitEvent('invoice', id, tenantId, 'invoice.status_changed', actor, {
            description: `Status changed to ${paymentStatus}`,
            oldValues: { paymentStatus: invoice.paymentStatus },
            newValues: { paymentStatus },
            tx
          });
        }
      });
      
      if (this.paymentService && paymentStatus === 'Paid') {
        await this.paymentService.cancelActivePaymentLinks(tenantId, id);
      }

      res.status(200).json({ message: 'Status updated successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  generatePaymentLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const actor = this.getActorContext(req);

      if (!this.paymentService) {
        next(new ValidationError('Payment service not configured'));
        return;
      }

      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      const paymentLink = await this.invoiceRepo.db.transaction(async (tx) => {
        const link = await this.paymentService!.getOrGeneratePaymentLink(tenantId, id, 'razorpay');
        if (this.eventService) {
          await this.eventService.emitEvent('invoice', id, tenantId, 'payment.link_generated', actor, {
            description: `Payment link generated`,
            newValues: { provider: 'razorpay', url: link },
            tx
          });
        }
        return link;
      });

      res.status(200).json({ url: paymentLink });
    } catch (error: any) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const actor = this.getActorContext(req);

      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      await this.invoiceRepo.db.transaction(async (tx) => {
        const deleted = await this.invoiceRepo.softDelete(id, tenantId, tx);
        if (!deleted) {
          throw new NotFoundError('Invoice not found');
        }
        if (this.eventService) {
          await this.eventService.emitEvent('invoice', id, tenantId, 'invoice.trashed', actor, {
            description: `Invoice #${invoice.invoiceNo} moved to Trash`,
            oldValues: {
              invoiceNo: invoice.invoiceNo,
              clientName: invoice.clientName,
              invoiceAmount: invoice.invoiceAmount,
              dueDate: invoice.dueDate,
              contactEmail: invoice.contactEmail,
              paymentStatus: invoice.paymentStatus
            },
            tx
          });
        }
      });

      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  permanentDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const actor = this.getActorContext(req);

      const invoice = await this.invoiceRepo.findByIdIncludingTrashed(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      if (!invoice.deletedAt) {
        next(new ValidationError('Invoice must be moved to Trash first before permanent deletion'));
        return;
      }

      await this.invoiceRepo.db.transaction(async (tx) => {
        if (this.eventService) {
          await this.eventService.emitEvent('invoice', id, tenantId, 'invoice.permanently_deleted', actor, {
            description: `Invoice #${invoice.invoiceNo} permanently deleted`,
            oldValues: {
              invoiceNo: invoice.invoiceNo,
              clientName: invoice.clientName,
              invoiceAmount: invoice.invoiceAmount,
              dueDate: invoice.dueDate,
              contactEmail: invoice.contactEmail,
              paymentStatus: invoice.paymentStatus
            },
            tx
          });
        }
        await this.invoiceRepo.hardDelete(id, tenantId, tx);
      });

      res.status(200).json({ message: 'Invoice permanently deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  };

  restore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const actor = this.getActorContext(req);

      const invoice = await this.invoiceRepo.findByIdIncludingTrashed(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        next(new NotFoundError('Invoice not found'));
        return;
      }

      if (!invoice.deletedAt) {
        next(new ValidationError('Invoice is already active'));
        return;
      }

      const restored = await this.invoiceRepo.db.transaction(async (tx) => {
        const result = await this.invoiceRepo.restore(id, tenantId, tx);
        if (!result) {
          throw new NotFoundError('Invoice not found');
        }

        if (this.eventService) {
          await this.eventService.emitEvent('invoice', id, tenantId, 'invoice.restored', actor, {
            description: `Invoice #${invoice.invoiceNo} restored from Trash`,
            newValues: {
              invoiceNo: invoice.invoiceNo,
              clientName: invoice.clientName,
              invoiceAmount: invoice.invoiceAmount,
              dueDate: invoice.dueDate,
              contactEmail: invoice.contactEmail,
              paymentStatus: invoice.paymentStatus
            },
            tx
          });
        }
        return result;
      });

      res.status(200).json(restored);
    } catch (error: any) {
      next(error);
    }
  };
}
