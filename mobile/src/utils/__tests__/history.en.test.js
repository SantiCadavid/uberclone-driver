// AI-assisted: see docs/AI_LOG.md #24
import { translate, translateOptions } from '../../i18n';
import { PAYMENT_FILTER_OPTIONS, PERIOD_OPTIONS } from '../../config/history';
import { formatDateTime, validateDateRange } from '../dates';

const tEn = (key, params) => translate('en', key, params);

describe('history in English', () => {
  test('date and time use AM/PM', () => {
    expect(formatDateTime(new Date(2026, 10, 11, 21, 42).getTime(), tEn)).toBe('11/11/2026 9:42 PM');
  });
  test('date range error', () => {
    expect(validateDateRange(new Date(2026, 10, 11), new Date(2026, 10, 10), tEn).to).toBe(
      'The end date must be the same as or later than the start date.',
    );
  });
  test('filter options', () => {
    expect(translateOptions(PERIOD_OPTIONS, tEn).map((option) => option.label)).toEqual([
      'Today',
      'Week',
      'Month',
      'Range',
    ]);
    expect(translateOptions(PAYMENT_FILTER_OPTIONS, tEn)[0]).toEqual({ value: null, label: 'All' });
  });
});