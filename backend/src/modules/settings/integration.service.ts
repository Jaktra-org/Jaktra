import sgClient from '@sendgrid/client';
import type { IntegrationRepository } from './integration.repository.js';
import { encrypt, decrypt } from '../../shared/encryption.js';
import { IntegrationErrors, IntegrationError } from './integration.errors.js';
import { logger } from '../../shared/logger.js';
import type { TenantIntegration } from '../../db/index.js';

export class IntegrationService {
  constructor(private readonly repo: IntegrationRepository) {}

  private getAadContext(tenantId: string, provider: string, version: number): string {
    return `${tenantId}:${provider}:v${version}`;
  }

  async getIntegrationStatus(tenantId: string, provider: 'sendgrid') {
    const integration = await this.repo.getIntegration(tenantId, provider);
    
    if (!integration) {
      return {
        provider,
        isConfigured: false,
        lastValidatedAt: null,
        lastValidationResult: 'unknown',
      };
    }

    return {
      provider,
      isConfigured: true,
      lastValidatedAt: integration.lastValidatedAt,
      lastValidationResult: integration.lastValidationResult,
    };
  }

  async validateAndSaveSendgridKey(tenantId: string, apiKey: string): Promise<void> {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw IntegrationErrors.CREDENTIAL_INVALID;
    }

    sgClient.setApiKey(apiKey);
    const request = {
      method: 'GET' as const,
      url: '/v3/scopes',
    };

    let validationResult: TenantIntegration['lastValidationResult'] = 'unknown';
    let errorCode: string | undefined;

    try {
      // AbortController could be used to enforce strict timeouts, but Sendgrid Client uses internal timeouts
      await sgClient.request(request);
      validationResult = 'valid';
    } catch (error: any) {
      const status = error.code || error.response?.statusCode;
      errorCode = String(status);

      logger.warn(`SendGrid validation failed for tenant ${tenantId}. Status: ${status}`);

      if (status === 400 || status === 401 || status === 403) {
        throw IntegrationErrors.CREDENTIAL_INVALID;
      } else if (status === 429) {
        throw IntegrationErrors.RATE_LIMITED;
      } else {
        throw IntegrationErrors.PROVIDER_UNAVAILABLE;
      }
    }

    const version = 1;
    const encrypted = encrypt(apiKey, this.getAadContext(tenantId, 'sendgrid', version));

    await this.repo.upsertIntegration({
      tenantId,
      provider: 'sendgrid',
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: version,
      lastValidatedAt: new Date(),
      lastValidationResult: validationResult,
      lastOperationalErrorCode: errorCode,
    });
  }

  async deleteSendgridIntegration(tenantId: string): Promise<void> {
    await this.repo.deleteIntegration(tenantId, 'sendgrid');
  }

  async getDecryptedSendgridKey(tenantId: string): Promise<string> {
    const integration = await this.repo.getIntegration(tenantId, 'sendgrid');
    if (!integration) {
      throw IntegrationErrors.NOT_CONFIGURED;
    }

    try {
      const aadContext = this.getAadContext(tenantId, 'sendgrid', integration.keyVersion);
      return decrypt({
        ciphertext: integration.ciphertext,
        iv: integration.iv,
        authTag: integration.authTag,
        keyVersion: integration.keyVersion,
      }, aadContext);
    } catch (e) {
      logger.error(`Decryption failed for tenant ${tenantId} SendGrid integration.`);
      throw IntegrationErrors.CREDENTIAL_INVALID;
    }
  }

  async handleDeliveryError(tenantId: string, provider: 'sendgrid', error: any): Promise<void> {
    const status = error.response?.statusCode;
    if (status === 401) {
      await this.repo.updateValidationStatus(tenantId, provider, 'revoked', String(status));
    } else if (status === 403) {
      const bodyStr = JSON.stringify(error.response?.body || {});
      if (bodyStr.includes('sender') || bodyStr.includes('identity')) {
        await this.repo.updateValidationStatus(tenantId, provider, 'unverified_sender', String(status));
      } else {
        await this.repo.updateValidationStatus(tenantId, provider, 'insufficient_scope', String(status));
      }
    }
  }
}
