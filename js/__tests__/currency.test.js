'use strict';

/**
 * Tests for currency formatting logic.
 *
 * The formatCurrency function in app.js is a method on the Alpine component
 * object. Rather than loading the entire app.js (which has many side-effects),
 * we replicate the pure formatting logic here and verify the underlying
 * Intl.NumberFormat behaviour that the app depends on.
 *
 * If formatCurrency in app.js is ever extracted to a utility, update these
 * tests to import it directly.
 */

// Minimal replica of app.js's formatCurrency for isolated testing
function formatCurrency(amount, currency, locale = 'en-GB', defaultCurrency = '') {
  const num = parseFloat(amount) || 0;
  const cur = (currency || defaultCurrency || '').toUpperCase();
  if (!cur) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(num);
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency: cur,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${cur} ${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(num)}`;
  }
}

describe('formatCurrency', () => {
  describe('GBP formatting (en-GB locale)', () => {
    it('formats a positive amount with currency symbol', () => {
      const result = formatCurrency(100, 'GBP', 'en-GB');
      expect(result).toMatch(/£/);
      expect(result).toMatch(/100/);
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0, 'GBP', 'en-GB');
      expect(result).toMatch(/£/);
      expect(result).toMatch(/0\.00/);
    });

    it('formats a negative amount', () => {
      const result = formatCurrency(-50.5, 'GBP', 'en-GB');
      expect(result).toMatch(/-/);
      expect(result).toMatch(/50/);
    });

    it('formats large numbers with separators', () => {
      const result = formatCurrency(1000000, 'GBP', 'en-GB');
      expect(result).toMatch(/1,000,000/);
    });
  });

  describe('USD formatting', () => {
    it('formats USD with dollar sign', () => {
      const result = formatCurrency(42.99, 'USD', 'en-GB');
      expect(result).toMatch(/\$/);
      expect(result).toMatch(/42\.99/);
    });
  });

  describe('ARS formatting (Argentine Peso)', () => {
    it('formats ARS amount', () => {
      const result = formatCurrency(1500, 'ARS', 'es-AR');
      // ARS formatting varies by environment; just ensure it includes the number
      expect(result).toMatch(/1.500|1,500/);
    });
  });

  describe('no currency code', () => {
    it('formats as plain decimal when no currency is provided', () => {
      const result = formatCurrency(99.5, '', 'en-GB');
      expect(result).toBe('99.50');
    });

    it('formats zero as plain decimal', () => {
      const result = formatCurrency(0, '', 'en-GB');
      expect(result).toBe('0.00');
    });
  });

  describe('unknown/invalid currency code', () => {
    it('falls back to manual prefix for unknown currency codes', () => {
      const result = formatCurrency(100, 'XYZ', 'en-GB');
      expect(result).toMatch(/XYZ/);
      expect(result).toMatch(/100/);
    });
  });

  describe('edge cases', () => {
    it('treats non-numeric amount as 0', () => {
      const result = formatCurrency('not-a-number', 'GBP', 'en-GB');
      expect(result).toMatch(/0\.00/);
    });

    it('parses string amounts correctly', () => {
      const result = formatCurrency('25.75', 'GBP', 'en-GB');
      expect(result).toMatch(/25\.75/);
    });

    it('handles lowercase currency codes by uppercasing them', () => {
      const lowerResult = formatCurrency(10, 'gbp', 'en-GB');
      const upperResult = formatCurrency(10, 'GBP', 'en-GB');
      expect(lowerResult).toBe(upperResult);
    });
  });
});
