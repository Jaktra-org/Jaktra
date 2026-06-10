import { Request, Response } from 'express';
import type { InvoiceImportService, DuplicateStrategy } from './invoice.service.js';
import type { InvoiceRepository } from './invoice.repository.js';
import { logger } from '../../shared/logger.js';
import {
  createInvoiceSchema,
  bulkCreateInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  listInvoicesSchema,
} from './invoice.schema.js';

export class InvoiceController {
  constructor(
    private importService: InvoiceImportService,
    private invoiceRepo: InvoiceRepository
  ) {}

  importFromCsv = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No CSV file provided. Use field name "file".' });
      return;
    }

    const tenantId = res.locals.tenantId as string;
    const duplicateStrategy = (req.query.on_duplicate as DuplicateStrategy) || 'skip';

    if (!['skip', 'update'].includes(duplicateStrategy)) {
      res.status(400).json({ error: 'on_duplicate must be "skip" or "update"' });
      return;
    }

    logger.info(`CSV import started for tenant ${tenantId} (${req.file.originalname}, ${req.file.size} bytes)`);

    const result = await this.importService.importFromCsv(
      req.file.buffer,
      tenantId,
      duplicateStrategy,
    );

    logger.info(`CSV import complete: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} errors`);

    res.status(200).json(result);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const data = createInvoiceSchema.parse(req.body);
      const result = await this.invoiceRepo.upsertByInvoiceNo({
        ...data,
        invoiceAmount: data.invoiceAmount.toString(),
        tenantId
      });
      
      if (result.wasUpdated) {
        res.status(200).json(result.invoice);
      } else {
        res.status(201).json(result.invoice);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.errors ? error.errors[0]?.message : error.message });
    }
  };

  createBulk = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const data = bulkCreateInvoiceSchema.parse(req.body);
      const invoicesToInsert = data.invoices.map(inv => ({
        ...inv,
        invoiceAmount: inv.invoiceAmount.toString(),
        tenantId
      }));
      const created = await this.invoiceRepo.createMany(invoicesToInsert);
      res.status(201).json({ created: created.length, invoices: created });
    } catch (error: any) {
      res.status(400).json({ error: error.errors ? error.errors[0]?.message : error.message });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
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
        urgencyTier: toArray(params.urgency_tier),
        clientName: params.client_name,
        daysOverdueMin: params.days_overdue_min,
        daysOverdueMax: params.days_overdue_max,
      });

      // Calculate daysOverdue dynamically on read
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dataWithDaysOverdue = result.data.map(inv => {
        const dueDate = new Date(inv.dueDate);
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return { ...inv, daysOverdue: daysOverdue > 0 ? daysOverdue : 0 };
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
      res.status(400).json({ error: error.errors ? error.errors[0]?.message : error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      
      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(invoice.dueDate);
      const diffTime = today.getTime() - dueDate.getTime();
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      res.status(200).json({ ...invoice, daysOverdue: daysOverdue > 0 ? daysOverdue : 0 });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const data = updateInvoiceSchema.parse(req.body);

      const updatedData: any = { ...data };
      if (data.invoiceAmount !== undefined) {
        updatedData.invoiceAmount = data.invoiceAmount.toString();
      }

      const updated = await this.invoiceRepo.update(id, tenantId, updatedData);
      if (!updated) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.errors ? error.errors[0]?.message : error.message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;
      const { paymentStatus } = updateInvoiceStatusSchema.parse(req.body);

      const invoice = await this.invoiceRepo.findById(id);
      if (!invoice || invoice.tenantId !== tenantId) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      await this.invoiceRepo.updatePaymentStatus(id, paymentStatus as any);
      res.status(200).json({ message: 'Status updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.errors ? error.errors[0]?.message : error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const id = req.params.id as string;

      const deleted = await this.invoiceRepo.softDelete(id, tenantId);
      if (!deleted) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
