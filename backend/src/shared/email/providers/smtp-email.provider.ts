import * as dns from 'dns/promises';
import net from 'net';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { ValidationError, ExternalServiceError } from '../../errors/index.js';
import { logger } from '../../logger.js';
import type { EmailProvider, EmailMessage, EmailSendResult } from '../index.js';

export const SmtpConfigSchema = z.object({
  payloadVersion: z.literal(1),
  host: z.string().min(1).max(253),
  port: z.union([z.literal(465), z.literal(587), z.literal(2525)]),
  securityMode: z.enum(['implicit_tls', 'starttls']),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(1024),
}).strict();

export type SmtpConfig = z.infer<typeof SmtpConfigSchema>;

function isProhibitedIP(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 0) return true; // Current network
    if (parts[0] === 10) return true; // Private
    if (parts[0] === 127) return true; // Loopback
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // Shared address space
    if (parts[0] === 169 && parts[1] === 254) return true; // Link-local
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // Private
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 0) return true; // IETF Protocol Assignments
    if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true; // TEST-NET-1
    if (parts[0] === 192 && parts[1] === 88 && parts[2] === 99) return true; // 6to4 Relay
    if (parts[0] === 192 && parts[1] === 168) return true; // Private
    if (parts[0] === 198 && parts[1] >= 18 && parts[1] <= 19) return true; // Network benchmark tests
    if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true; // TEST-NET-2
    if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true; // TEST-NET-3
    if (parts[0] >= 224 && parts[0] <= 239) return true; // Multicast
    if (parts[0] >= 240 && parts[0] <= 255) return true; // Reserved
    return false;
  }
  
  if (net.isIPv6(ip)) {
    const ipLower = ip.toLowerCase();
    if (ipLower === '::1') return true; // Loopback
    if (ipLower === '::') return true; // Unspecified
    if (ipLower.startsWith('fe80:')) return true; // Link-local
    if (ipLower.startsWith('fc') || ipLower.startsWith('fd')) return true; // Unique local
    if (ipLower.startsWith('ff')) return true; // Multicast
    if (ipLower.startsWith('::ffff:')) {
      const ipv4Part = ipLower.substring(7);
      return isProhibitedIP(ipv4Part);
    }
    return false;
  }
  
  return true; // Not IPv4 or IPv6, reject
}

export class SmtpConnectionFactory {
  static async validatePayload(payload: unknown): Promise<SmtpConfig> {
    const result = SmtpConfigSchema.safeParse(payload);
    if (!result.success) {
      throw new ValidationError(`Invalid SMTP configuration payload: ${result.error.message}`);
    }
    return result.data;
  }

  static async resolveAndValidateHost(host: string): Promise<string> {
    if (net.isIP(host)) {
      if (isProhibitedIP(host)) {
        throw new ValidationError(`IP literals pointing to private space are not allowed: ${host}`);
      }
      throw new ValidationError('IP literals are not allowed. Please provide a valid hostname.');
    }

    let records4: string[] = [];
    let records6: string[] = [];

    try {
      records4 = await dns.resolve4(host);
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ENODATA' && (e as { code?: string }).code !== 'ENOTFOUND') {
        throw new ExternalServiceError(`DNS resolution failed for ${host}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    try {
      records6 = await dns.resolve6(host);
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ENODATA' && (e as { code?: string }).code !== 'ENOTFOUND') {
        throw new ExternalServiceError(`DNS resolution failed for ${host}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const allRecords = [...records4, ...records6];

    if (allRecords.length === 0) {
      throw new ValidationError(`No DNS records found for host ${host}`);
    }

    let hasSafe = false;
    for (const ip of allRecords) {
      if (isProhibitedIP(ip)) {
        throw new ValidationError(`Host ${host} resolved to a prohibited IP address: ${ip}`);
      }
      hasSafe = true;
    }

    if (!hasSafe) {
      throw new ValidationError(`No safe public IP addresses found for host ${host}`);
    }

    return records4.length > 0 ? records4[0] : records6[0];
  }

  static async createTransporter(config: SmtpConfig): Promise<nodemailer.Transporter> {
    const validConfig = await this.validatePayload(config);
    
    if (validConfig.port === 465 && validConfig.securityMode !== 'implicit_tls') {
      throw new ValidationError('Port 465 requires implicit_tls securityMode');
    }
    if ((validConfig.port === 587 || validConfig.port === 2525) && validConfig.securityMode !== 'starttls') {
      throw new ValidationError(`Port ${validConfig.port} requires starttls securityMode`);
    }

    const pinnedIp = await this.resolveAndValidateHost(validConfig.host);

    const transportOptions = {
      host: pinnedIp,
      port: validConfig.port,
      secure: validConfig.securityMode === 'implicit_tls',
      requireTLS: validConfig.securityMode === 'starttls',
      auth: {
        user: validConfig.username,
        pass: validConfig.password,
      },
      tls: {
        servername: validConfig.host,
        rejectUnauthorized: true,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
      name: validConfig.host
    };

    return nodemailer.createTransport(transportOptions);
  }

  static async executeWithTimeout<T>(
    transporter: nodemailer.Transporter,
    operation: () => Promise<T>,
    timeoutMs: number = 30000
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        transporter.close();
        reject(new ExternalServiceError(`SMTP operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';

  constructor(
    private readonly config: {
      host: string;
      port: number;
      user: string;
      password: string;
      secure: boolean;
    }
  ) {}

  private checkHeaderInjection(value: string | undefined): void {
    if (!value) return;
    if (value.includes('\r') || value.includes('\n')) {
      throw new ValidationError('Header injection detected. CR/LF characters are not allowed.');
    }
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.checkHeaderInjection(message.to);
    this.checkHeaderInjection(message.from.name);
    this.checkHeaderInjection(message.from.email);
    if (message.replyTo) this.checkHeaderInjection(message.replyTo);
    this.checkHeaderInjection(message.subject);

    const msg = {
      to: message.to,
      from: `"${message.from.name}" <${message.from.email}>`,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    };

    const smtpConfig: SmtpConfig = {
      payloadVersion: 1,
      host: this.config.host,
      port: this.config.port as 465 | 587 | 2525,
      securityMode: this.config.secure ? 'implicit_tls' : 'starttls',
      username: this.config.user,
      password: this.config.password,
    };

    let transporter;
    try {
      transporter = await SmtpConnectionFactory.createTransporter(smtpConfig);
      
      const info = await SmtpConnectionFactory.executeWithTimeout(
        transporter,
        () => transporter!.sendMail(msg),
        30000
      ) as { rejected?: string[]; messageId?: string };

      if (info && info.rejected && info.rejected.length > 0) {
        throw new ValidationError(`SMTP server synchronously rejected recipients: ${info.rejected.join(', ')}`);
      }

      logger.info(`[LIVE] Email sent successfully to ${message.to} from ${message.from.email} via SMTP`);
      return {
        success: true,
        providerMessageId: info.messageId,
      };
    } catch (error: unknown) {
      logger.error(`[LIVE] Failed to send email via SMTP to ${message.to}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      if (transporter) {
        transporter.close();
      }
    }
  }
}
