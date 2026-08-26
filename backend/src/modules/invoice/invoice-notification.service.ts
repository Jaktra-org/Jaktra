import type { Invoice } from '../../db/schema.js';
import type { CommunicationService } from '../communication/communication.service.js';
import type { PortalService } from '../portal/portal.service.js';
import type { SettingsRepository } from '../settings/settings.repository.js';
import { logger } from '../../shared/logger.js';
import { config } from '../../config/index.js';

export interface InitialInvoiceEmailParams {
  companyName: string;
  clientName: string;
  invoiceNo: string;
  amount: string;
  currency?: string;
  dueDate: string;
  createdAt: Date | string;
  description?: string | null;
  portalUrl: string;
  supportEmail?: string | null;
}

export function formatCurrencyAmount(amount: string | number, currency: string = 'USD'): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return `${currency} ${amount}`;

  try {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      CAD: 'CA$',
      AUD: 'AU$',
    };

    const symbol = symbolMap[currency.toUpperCase()];
    const formattedNumber = num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return symbol ? `${symbol}${formattedNumber}` : `${currency.toUpperCase()} ${formattedNumber}`;
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function renderInitialInvoiceEmailHtml(params: InitialInvoiceEmailParams): string {
  const {
    companyName,
    clientName,
    invoiceNo,
    amount,
    currency = 'USD',
    dueDate,
    createdAt,
    description,
    portalUrl,
    supportEmail,
  } = params;

  const formattedAmount = formatCurrencyAmount(amount, currency);
  const formattedDueDate = formatDate(dueDate);
  const formattedCreatedDate = formatDate(createdAt);

  const supportText = supportEmail && supportEmail.trim()
    ? `If you have any questions about this invoice, simply reply to this email or reach out to our <a href="mailto:${supportEmail.trim()}" style="color: #0052cc; text-decoration: underline; font-weight: 500;">support team</a> for help.`
    : `If you have any questions about this invoice, simply reply to this email for help.`;

  const descriptionRow = (description && description.trim())
    ? `<tr>
        <td style="padding: 12px 0; font-size: 14px; color: #172b4d; vertical-align: top; word-break: break-word;">${description.trim()}</td>
        <td style="padding: 12px 0; font-size: 14px; color: #172b4d; text-align: right; vertical-align: top; font-weight: 600; white-space: nowrap;">${formattedAmount}</td>
      </tr>`
    : `<tr>
        <td style="padding: 12px 0; font-size: 14px; color: #172b4d; vertical-align: top;">Invoice #${invoiceNo}</td>
        <td style="padding: 12px 0; font-size: 14px; color: #172b4d; text-align: right; vertical-align: top; font-weight: 600; white-space: nowrap;">${formattedAmount}</td>
      </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${invoiceNo} from ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172b4d; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0; overflow: hidden;">
          
          <!-- Header / Company Logo -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center;">
              <table align="center" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #0052cc; transform: rotate(45deg); border-radius: 2px;"></span>
                  </td>
                  <td style="vertical-align: middle; font-size: 18px; font-weight: 700; color: #091e42; letter-spacing: -0.2px;">
                    ${companyName}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Salutation & Intro -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #091e42; line-height: 1.3;">
                Hi ${clientName},
              </h1>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #42526e;">
                Thanks for using ${companyName}. This is an invoice for your recent purchase.
              </p>
            </td>
          </tr>

          <!-- Highlighted Amount & Due Date Box -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; border-radius: 6px; padding: 16px 20px;">
                <tr>
                  <td style="font-size: 14px; line-height: 1.6; color: #172b4d;">
                    <div style="margin-bottom: 4px;">
                      <strong style="color: #091e42;">Amount Due:</strong> ${formattedAmount}
                    </div>
                    <div>
                      <strong style="color: #091e42;">Due By:</strong> ${formattedDueDate}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td align="center" style="padding: 0 32px 32px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #0052cc;">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; padding: 12px 36px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; -webkit-text-size-adjust: none;">
                      Payment Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Details Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <!-- Header row: Invoice ID & Date -->
                <tr>
                  <td style="font-size: 15px; font-weight: 700; color: #091e42; padding-bottom: 12px;">
                    ${invoiceNo}
                  </td>
                  <td style="font-size: 15px; font-weight: 700; color: #091e42; text-align: right; padding-bottom: 12px;">
                    ${formattedCreatedDate}
                  </td>
                </tr>
                <!-- Subheader row -->
                <tr style="border-top: 1px solid #ebecf0; border-bottom: 1px solid #ebecf0;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b778c;">
                    Description
                  </td>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b778c; text-align: right;">
                    Amount
                  </td>
                </tr>
                <!-- Line item row -->
                ${descriptionRow}
              </table>
            </td>
          </tr>

          <!-- Support & Help text -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #42526e;">
                ${supportText}
              </p>
              <p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #42526e;">
                Cheers,<br>
                <strong>The ${companyName} Team</strong>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #ebecf0; margin: 0;">
            </td>
          </tr>

          <!-- Fallback URL -->
          <tr>
            <td style="padding: 20px 32px 32px 32px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #6b778c;">
                If you're having trouble with the button above, copy and paste the URL below into your web browser:
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; word-break: break-all;">
                <a href="${portalUrl}" style="color: #0052cc; text-decoration: underline;">${portalUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export class InvoiceNotificationService {
  constructor(
    private communicationService: CommunicationService,
    private portalService: PortalService,
    private settingsRepo: SettingsRepository
  ) {}

  async sendInitialInvoiceEmail(tenantId: string, invoice: Invoice): Promise<boolean> {
    try {
      if (!invoice.contactEmail || !invoice.contactEmail.trim()) {
        logger.warn(`Skipping initial invoice email for invoice ${invoice.id}: contact email is empty.`);
        return false;
      }

      // 1. Get or create portal link token
      const token = await this.portalService.getOrCreatePortalLink(tenantId, invoice.id);
      const portalUrl = `${config.FRONTEND_URL}/i/${token}`;

      // 2. Fetch tenant settings for companyName and supportEmail
      let settings = await this.settingsRepo.getSettings(tenantId);
      if (!settings) {
        settings = await this.settingsRepo.createDefaultSettings(tenantId);
      }

      const companyName = settings.companyName || 'Company';
      const supportEmail = settings.supportEmail || null;

      // 3. Render HTML email
      const html = renderInitialInvoiceEmailHtml({
        companyName,
        clientName: invoice.clientName,
        invoiceNo: invoice.invoiceNo,
        amount: invoice.invoiceAmount,
        currency: invoice.currency || 'USD',
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt,
        description: invoice.subject,
        portalUrl,
        supportEmail,
      });

      const subject = `Invoice #${invoice.invoiceNo} from ${companyName}`;

      // 4. Dispatch via CommunicationService
      await this.communicationService.send({
        tenantId,
        to: invoice.contactEmail,
        subject,
        html,
        channel: 'email',
        invoiceId: invoice.id,
        source: 'system',
      });

      logger.info(`Initial invoice email sent successfully for invoice #${invoice.invoiceNo} to ${invoice.contactEmail}`);
      return true;
    } catch (err: unknown) {
      logger.warn(`Failed to send initial invoice email for invoice #${invoice.invoiceNo} (${invoice.id}): ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }

  async sendInitialInvoiceEmailsBatch(tenantId: string, invoiceList: Invoice[]): Promise<void> {
    for (const inv of invoiceList) {
      await this.sendInitialInvoiceEmail(tenantId, inv);
    }
  }
}
