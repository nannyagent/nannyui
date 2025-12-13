import { describe, it, expect } from 'vitest';
import { validatePassword, getPasswordRequirements } from '@/utils/passwordValidator';

describe('passwordValidator', () => {
  describe('validatePassword', () => {
    it('should reject password that is too short', () => {
      const result = validatePassword('Pass1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.requirements.minLength).toBe(false);
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.requirements.hasUppercase).toBe(false);
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
      expect(result.requirements.hasLowercase).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validatePassword('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.requirements.hasNumber).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
      expect(result.requirements.hasSpecialChar).toBe(false);
    });

    it('should accept valid password with all requirements', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.requirements.minLength).toBe(true);
      expect(result.requirements.hasUppercase).toBe(true);
      expect(result.requirements.hasLowercase).toBe(true);
      expect(result.requirements.hasNumber).toBe(true);
      expect(result.requirements.hasSpecialChar).toBe(true);
    });

    it('should accept valid password with different special characters', () => {
      const validPasswords = [
        'Test@Password123',
        'Test#Password456',
        'Test$Password789',
        'Test%Password000',
        'Test^Password111',
        'Test&Password222',
        'Test*Password333',
      ];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should handle multiple validation errors', () => {
      const result = validatePassword('pass');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
    });

    it('should return all requirement statuses', () => {
      const result = validatePassword('Pass123!');
      expect(result.requirements).toHaveProperty('minLength');
      expect(result.requirements).toHaveProperty('hasUppercase');
      expect(result.requirements).toHaveProperty('hasLowercase');
      expect(result.requirements).toHaveProperty('hasNumber');
      expect(result.requirements).toHaveProperty('hasSpecialChar');
    });

    it('should treat empty password as invalid', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept longer passwords', () => {
      const result = validatePassword('VeryLongPassword123!@#$%^');
      expect(result.isValid).toBe(true);
    });
  });

  describe('getPasswordRequirements', () => {
    it('should return array of requirement strings', () => {
      const requirements = getPasswordRequirements();
      expect(Array.isArray(requirements)).toBe(true);
      expect(requirements.length).toBe(5);
    });

    it('should contain all required descriptions', () => {
      const requirements = getPasswordRequirements();
      expect(requirements).toContain('At least 8 characters');
      expect(requirements).toContain('One uppercase letter (A-Z)');
      expect(requirements).toContain('One lowercase letter (a-z)');
      expect(requirements).toContain('One number (0-9)');
      expect(requirements).toContain('One special character (!@#$%^&*)');
    });
  });
});
