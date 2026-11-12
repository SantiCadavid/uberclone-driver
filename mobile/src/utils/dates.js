// AI-assisted: see docs/AI_LOG.md #19
import { PERIODS } from '../config/history';

const pad = (value) => String(value).padStart(2, '0');

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

export function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

// Weeks start on Monday (Colombia)
export function startOfWeek(date) {
  const result = startOfDay(date);
  const daysSinceMonday = (result.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  result.setDate(result.getDate() - daysSinceMonday);
  return result;
}

export function startOfMonth(date) {
  const result = startOfDay(date);
  result.setDate(1);
  return result;
}

// { startMs, endMs } with both ends included, or null for an invalid custom range
export function getPeriodRange(period, now = new Date(), custom = {}) {
  const endMs = endOfDay(now).getTime();
  switch (period) {
    case PERIODS.today:
      return { startMs: startOfDay(now).getTime(), endMs };
    case PERIODS.week:
      return { startMs: startOfWeek(now).getTime(), endMs };
    case PERIODS.month:
      return { startMs: startOfMonth(now).getTime(), endMs };
    case PERIODS.range: {
      if (!isValidDate(custom.from) || !isValidDate(custom.to)) return null;
      const range = { startMs: startOfDay(custom.from).getTime(), endMs: endOfDay(custom.to).getTime() };
      return range.startMs <= range.endMs ? range : null;
    }
    default:
      return null;
  }
}

// Errors shown under each date field (never in an Alert)
export function validateDateRange(from, to) {
  const errors = { from: null, to: null };
  if (!isValidDate(from)) errors.from = 'Selecciona la fecha inicial.';
  if (!isValidDate(to)) errors.to = 'Selecciona la fecha final.';
  if (!errors.from && !errors.to && startOfDay(from) > startOfDay(to)) {
    errors.to = 'La fecha final debe ser igual o posterior a la inicial.';
  }
  return errors;
}

// 1794451320000 -> "11/11/2026 9:42 p. m."
export function formatDateTime(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return '—';
  const date = new Date(ms);
  const hours = date.getHours();
  const suffix = hours < 12 ? 'a. m.' : 'p. m.';
  const hours12 = hours % 12 || 12;
  return `${formatDate(date)} ${hours12}:${pad(date.getMinutes())} ${suffix}`;
}

// Date -> "11/11/2026"
export function formatDate(date) {
  if (!isValidDate(date)) return '—';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}