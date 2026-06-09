import { Request, Response } from 'express';
import type { InvoiceImportService, DuplicateStrategy } from './invoice.service.js';
import { logger } from '../../shared/logger.js';

export class InvoiceController {
  constructor(private importService: InvoiceImportService) {}

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
}
