import { describe, it, expect } from 'vitest';
import { formatBRL } from '@/lib/formatters';

describe('formatBRL', () => {
  it('formats integer values to BRL currency string', () => {
    expect(formatBRL(17)).toBe('R$ 17,00');
    expect(formatBRL(5)).toBe('R$ 5,00');
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formats decimal values correctly with comma separator', () => {
    expect(formatBRL(5.5)).toBe('R$ 5,50');
    expect(formatBRL(17.99)).toBe('R$ 17,99');
    expect(formatBRL(1234.56)).toBe('R$ 1234,56');
  });
});
