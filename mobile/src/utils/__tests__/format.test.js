// AI-assisted: see docs/AI_LOG.md #15
import { formatCop } from '../format';

describe('formatCop', () => {
  test('formats whole pesos with thousand separators', () => {
    expect(formatCop(19200)).toBe('$19.200');
    expect(formatCop(1000000)).toBe('$1.000.000');
    expect(formatCop(-1200)).toBe('-$1.200');
    expect(formatCop(null)).toBe('—');
  });
});