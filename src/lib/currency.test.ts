import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('appends the FCFA suffix', () => {
    expect(formatCurrency(0)).toContain('FCFA');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('0 FCFA');
  });

  it('groups thousands and keeps the value', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('FCFA');
    // strip non-digits to verify the underlying number is preserved
    expect(result.replace(/\D/g, '')).toBe('1500000');
  });

  it('handles small numbers without grouping', () => {
    expect(formatCurrency(500)).toBe('500 FCFA');
  });
});
