import { getCurrencyList, formatCurrency, getCurrencySymbol, calculatePercentage } from './currency';

describe('currency utilities', () => {
  test('getCurrencyList includes USD', () => {
    const list = getCurrencyList();
    expect(Array.isArray(list)).toBe(true);
    expect(list.some(c => c.code === 'USD')).toBe(true);
  });

  test('formatCurrency formats USD correctly', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toMatch(/\$1,234\.56/);
  });

  test('getCurrencySymbol returns symbol', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  test('calculatePercentage computes percentage', () => {
    expect(calculatePercentage(50, 200)).toBe('25%');
    expect(calculatePercentage(0, 0)).toBe('0%');
  });
});
