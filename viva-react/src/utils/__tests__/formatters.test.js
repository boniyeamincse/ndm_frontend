import { describe, it, expect } from 'vitest';
import { formatDate, formatMemberId } from '../formatters';

describe('Formatters Utility', () => {
  describe('formatDate', () => {
    it('should format valid date to en-GB format', () => {
      const date = new Date('2026-03-26');
      const result = formatDate(date);
      expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
      expect(result).toContain('Mar');
    });

    it('should handle ISO date strings', () => {
      const result = formatDate('2026-03-26');
      expect(result).toBeTruthy();
      expect(result).toMatch(/^\d{1,2} \w{3} \d{4}$/);
    });

    it('should return empty string for null date', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should return empty string for undefined date', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatMemberId', () => {
    it('should format member ID with NDM-SW prefix', () => {
      const result = formatMemberId('2026-0001');
      expect(result).toBe('NDM-SW-2026-0001');
    });

    it('should handle numeric input', () => {
      const result = formatMemberId('2026-0002');
      expect(result).toMatch(/^NDM-SW-/);
    });

    it('should return empty string for null', () => {
      expect(formatMemberId(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatMemberId(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatMemberId('')).toBe('');
    });
  });
});
