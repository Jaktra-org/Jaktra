import crypto from 'crypto';
import { config } from '../config/index.js';

const ENCRYPTION_KEY = Buffer.from(config.ENCRYPTION_KEY, 'base64');
const ALGORITHM = 'aes-256-gcm';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

export function encrypt(plaintext: string, aadContext: string): EncryptedData {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  cipher.setAAD(Buffer.from(aadContext, 'utf8'));

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    keyVersion: 1, // hardcoded for now, can be incremented on rotation
  };
}

export function decrypt(data: EncryptedData, aadContext: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(data.iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(data.authTag, 'base64'));
  decipher.setAAD(Buffer.from(aadContext, 'utf8'));

  let decrypted = decipher.update(data.ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
