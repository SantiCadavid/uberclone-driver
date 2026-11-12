// AI-assisted: see docs/AI_LOG.md #19
import { formatDateTime, getPeriodRange, startOfWeek, validateDateRange } from '../dates';
import { PERIODS } from '../../config/history';

// Local dates (months are 0-based): 2026-11-11 is a Wednesday
const wednesday = new Date(2026, 10, 11, 15, 30);

describe('startOfWeek', () => {
  test('Wednesday goes back to Monday at 00:00', () => {
    expect(startOfWeek(wednesday)).toEqual(new Date(2026, 10, 9));
  });
  test('Sunday belongs to the week that started the previous Monday', () => {
    expect(startOfWeek(new Date(2026, 10, 15, 22, 0))).toEqual(new Date(2026, 10, 9));
  });
  test('Monday stays on the same day', () => {
    expect(startOfWeek(new Date(2026, 10, 9, 8, 0))).toEqual(new Date(2026, 10, 9));
  });
});

describe('getPeriodRange', () => {
  test('today goes from 00:00 to 23:59:59.999', () => {
    expect(getPeriodRange(PERIODS.today, wednesday)).toEqual({
      startMs: new Date(2026, 10, 11).getTime(),
      endMs: new Date(2026, 10, 11, 23, 59, 59, 999).getTime(),
    });
  });
  test('month starts on day 1', () => {
    expect(getPeriodRange(PERIODS.month, wednesday).startMs).toBe(new Date(2026, 10, 1).getTime());
  });
  test('custom range includes the whole last day', () => {
    const range = getPeriodRange(PERIODS.range, wednesday, {
      from: new Date(2026, 9, 20, 10),
      to: new Date(2026, 9, 25, 9),
    });
    expect(range).toEqual({
      startMs: new Date(2026, 9, 20).getTime(),
      endMs: new Date(2026, 9, 25, 23, 59, 59, 999).getTime(),
    });
  });
  test('custom range with the start after the end is invalid', () => {
    expect(
      getPeriodRange(PERIODS.range, wednesday, { from: new Date(2026, 9, 26), to: new Date(2026, 9, 25) }),
    ).toBeNull();
  });
});

describe('validateDateRange', () => {
  test('accepts the same day as start and end, whatever the hour', () => {
    expect(validateDateRange(new Date(2026, 10, 11, 9), new Date(2026, 10, 11, 8))).toEqual({ from: null, to: null });
  });
  test('rejects an end before the start', () => {
    expect(validateDateRange(new Date(2026, 10, 11), new Date(2026, 10, 10)).to).toBe(
      'La fecha final debe ser igual o posterior a la inicial.',
    );
  });
});

describe('formatDateTime', () => {
  test('evening in 12-hour format', () => {
    expect(formatDateTime(new Date(2026, 10, 11, 21, 42).getTime())).toBe('11/11/2026 9:42 p. m.');
  });
  test('midnight shows 12 a. m.', () => {
    expect(formatDateTime(new Date(2026, 0, 5, 0, 7).getTime())).toBe('05/01/2026 12:07 a. m.');
  });
  test('an invalid value shows a dash', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});