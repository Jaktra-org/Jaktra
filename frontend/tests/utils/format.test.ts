import { formatCurrency, formatDateValue, formatCurrencyUSD } from '../../src/utils/format';

describe('format utility', () => {
  describe('formatCurrency', () => {
    it('formats numbers into Indian Rupees currency', () => {
      const cleanOutput = (val: string) => val.replace(/\s+/g, ' ');

      expect(cleanOutput(formatCurrency(1000))).toContain('1,000.00');
      expect(cleanOutput(formatCurrency(1000))).toContain('₹');
      expect(cleanOutput(formatCurrency('2500.50'))).toContain('2,500.50');
      expect(cleanOutput(formatCurrency(-500))).toContain('500.00');
    });

    it('returns ₹0.00 fallback for invalid numeric values', () => {
      expect(formatCurrency(NaN)).toBe('₹0.00');
      expect(formatCurrency('invalid-amount')).toBe('₹0.00');
      expect(formatCurrency(null)).toBe('₹0.00');
      expect(formatCurrency(undefined)).toBe('₹0.00');
    });
  });

  describe('formatDateValue', () => {
    it('formats valid ISO dates, timestamps and Date instances', () => {
      const localDate = new Date(2026, 6, 13); // July 13, 2026 (local time)
      expect(formatDateValue(localDate)).toBe('13 Jul 2026');
      expect(formatDateValue(localDate.getTime())).toBe('13 Jul 2026');
    });

    it('returns None fallback for nullish or empty values', () => {
      expect(formatDateValue(null)).toBe('None');
      expect(formatDateValue(undefined)).toBe('None');
      expect(formatDateValue('')).toBe('None');
    });

    it('returns the input as string for invalid date values', () => {
      expect(formatDateValue('invalid-date-string')).toBe('invalid-date-string');
    });
  });

  describe('formatCurrencyUSD', () => {
    it('formats values into US Dollars without cents', () => {
      expect(formatCurrencyUSD(500)).toBe('$500');
      expect(formatCurrencyUSD('1250')).toBe('$1,250');
    });

    it('returns $0 fallback for invalid numeric values', () => {
      expect(formatCurrencyUSD(NaN)).toBe('$0');
      expect(formatCurrencyUSD('invalid-amount')).toBe('$0');
    });
  });
});
