import { describe, it, expect } from 'vitest';
import { validatePhone, validateNID } from '../validators';

describe('Validators Utility', () => {
  describe('validatePhone', () => {
    it('should validate Bangladeshi phone number with +8801 prefix', () => {
      expect(validatePhone('+8801712345678')).toBe(true);
      expect(validatePhone('+8801913456789')).toBe(true);
    });

    it('should validate Bangladeshi phone number with 01 prefix', () => {
      expect(validatePhone('01712345678')).toBe(true);
      expect(validatePhone('01913456789')).toBe(true);
    });

    it('should accept 3-9 as second digit after 01/+8801', () => {
      expect(validatePhone('01312345678')).toBe(true);
      expect(validatePhone('01912345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(false);
      expect(validatePhone('+1-555-0100')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });

    it('should reject phone numbers with invalid second digit', () => {
      expect(validatePhone('01012345678')).toBe(false);
      expect(validatePhone('01112345678')).toBe(false);
      expect(validatePhone('01212345678')).toBe(false);
    });

    it('should reject phone numbers with wrong length', () => {
      expect(validatePhone('0171234567')).toBe(false);
      expect(validatePhone('017123456789')).toBe(false);
    });
  });

  describe('validateNID', () => {
    it('should validate 10-digit NID', () => {
      expect(validateNID('1234567890')).toBe(true);
    });

    it('should validate 13-digit NID', () => {
      expect(validateNID('1234567890123')).toBe(true);
    });

    it('should validate 17-digit NID', () => {
      expect(validateNID('12345678901234567')).toBe(true);
    });

    it('should reject non-numeric NID', () => {
      expect(validateNID('12345ABCDE')).toBe(false);
      expect(validateNID('123-456-7890')).toBe(false);
    });

    it('should reject NID with invalid length', () => {
      expect(validateNID('123')).toBe(false);
      expect(validateNID('123456789')).toBe(false);
      expect(validateNID('12345678901')).toBe(false);
      expect(validateNID('123456789012345')).toBe(false);
      expect(validateNID('12345678901234567890')).toBe(false);
    });

    it('should reject empty NID', () => {
      expect(validateNID('')).toBe(false);
    });
  });
});
