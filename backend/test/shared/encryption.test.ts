import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/shared/encryption.js';

describe('Encryption Utility', () => {
  it('successfully encrypts and decrypts with correct AAD context', () => {
    const secret = 'super-secret-password-123';
    const aadContext = 'tenant-1:smtp:v1';

    const encrypted = encrypt(secret, aadContext);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();

    const decrypted = decrypt(encrypted, aadContext);
    expect(decrypted).toBe(secret);
  });

  it('fails decryption if AAD context is different', () => {
    const secret = 'super-secret-password-123';
    const aadContext = 'tenant-1:smtp:v1';
    const wrongAadContext = 'tenant-2:smtp:v1';

    const encrypted = encrypt(secret, aadContext);

    expect(() => {
      decrypt(encrypted, wrongAadContext);
    }).toThrow();
  });

  it('fails decryption if ciphertext or auth tag is tampered with', () => {
    const secret = 'super-secret-password-123';
    const aadContext = 'tenant-1:smtp:v1';

    const encrypted = encrypt(secret, aadContext);

    // Tamper ciphertext
    const tamperedCiphertext = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.substring(0, encrypted.ciphertext.length - 4) + 'AAAA',
    };

    expect(() => {
      decrypt(tamperedCiphertext, aadContext);
    }).toThrow();

    // Tamper auth tag
    const tamperedAuthTag = {
      ...encrypted,
      authTag: encrypted.authTag.substring(0, encrypted.authTag.length - 4) + 'AAAA',
    };

    expect(() => {
      decrypt(tamperedAuthTag, aadContext);
    }).toThrow();
  });
});
