import { describe, it, expect } from 'vitest';
import {
  generateTOTPSecret,
  generateBackupCodes,
  formatBackupCode,
  generateTOTPQRUrl,
} from '@/utils/mfaUtils';

describe('mfaUtils', () => {
  describe('generateTOTPSecret', () => {
    it('should generate a 32-character base32 secret', () => {
      const secret = generateTOTPSecret();
      expect(secret).toHaveLength(32);
    });

    it('should generate only valid base32 characters', () => {
      const secret = generateTOTPSecret();
      const base32Regex = /^[A-Z2-7]+$/;
      expect(base32Regex.test(secret)).toBe(true);
    });

    it('should generate different secrets each time', () => {
      const secret1 = generateTOTPSecret();
      const secret2 = generateTOTPSecret();
      expect(secret1).not.toBe(secret2);
    });

    it('should generate multiple unique secrets', () => {
      const secrets = new Set();
      for (let i = 0; i < 10; i++) {
        secrets.add(generateTOTPSecret());
      }
      expect(secrets.size).toBe(10); // All should be unique
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate default 8 backup codes', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(8);
    });

    it('should generate specified number of backup codes', () => {
      const codes = generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it('should generate 8-character codes', () => {
      const codes = generateBackupCodes();
      codes.forEach((code) => {
        expect(code).toHaveLength(8);
      });
    });

    it('should generate alphanumeric uppercase codes', () => {
      const codes = generateBackupCodes();
      const alphanumericRegex = /^[A-Z0-9]{8}$/;
      codes.forEach((code) => {
        expect(alphanumericRegex.test(code)).toBe(true);
      });
    });

    it('should generate unique backup codes', () => {
      const codes = generateBackupCodes(10);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(10); // All should be unique
    });

    it('should generate different codes on each call', () => {
      const codes1 = generateBackupCodes(3);
      const codes2 = generateBackupCodes(3);
      const allCodes = new Set([...codes1, ...codes2]);
      expect(allCodes.size).toBe(6); // All 6 codes should be unique across both calls
    });
  });

  describe('formatBackupCode', () => {
    it('should format code with dash in the middle', () => {
      const formatted = formatBackupCode('ABCD1234');
      expect(formatted).toBe('ABCD-1234');
    });

    it('should handle various code patterns', () => {
      const testCases = [
        ['AAAAAAAA', 'AAAA-AAAA'],
        ['12345678', '1234-5678'],
        ['AbCd1234', 'AbCd-1234'],
      ];

      testCases.forEach(([input, expected]) => {
        expect(formatBackupCode(input)).toBe(expected);
      });
    });

    it('should preserve code length', () => {
      const code = 'TEST1234';
      const formatted = formatBackupCode(code);
      expect(formatted.replace('-', '')).toBe(code);
    });
  });

  describe('generateTOTPQRUrl', () => {
    it('should generate valid otpauth:// URL', () => {
      const url = generateTOTPQRUrl('user@example.com', 'JBSWY3DPEBLW64TMMQ5HK6YTJFYG2W5J');
      expect(url).toContain('otpauth://totp/');
    });

    it('should include email in URL', () => {
      const email = 'test@example.com';
      const url = generateTOTPQRUrl(email, 'SECRET123');
      expect(url).toContain(encodeURIComponent(email));
    });

    it('should include secret in URL', () => {
      const secret = 'JBSWY3DPEBLW64TMMQ5HK6YTJFYG2W5J';
      const url = generateTOTPQRUrl('user@example.com', secret);
      expect(url).toContain(secret);
    });

    it('should include issuer parameter', () => {
      const url = generateTOTPQRUrl('user@example.com', 'SECRET123');
      expect(url).toContain('issuer=NannyAI');
    });

    it('should use custom app name if provided', () => {
      const url = generateTOTPQRUrl('user@example.com', 'SECRET123', 'CustomApp');
      expect(url).toContain('CustomApp');
      expect(url).toContain('issuer=CustomApp');
    });

    it('should properly encode special characters in email', () => {
      const email = 'user+test@example.com';
      const url = generateTOTPQRUrl(email, 'SECRET123');
      expect(url).toContain(encodeURIComponent(email));
    });

    it('should generate RFC-compliant otpauth:// URL', () => {
      const url = generateTOTPQRUrl('user@example.com', 'JBSWY3DPEBLW64TMMQ5HK6YTJFYG2W5J');
      expect(url).toMatch(/^otpauth:\/\/totp\/.+\?/);
      expect(url).toContain('secret=');
      expect(url).toContain('issuer=');
    });
  });
});
