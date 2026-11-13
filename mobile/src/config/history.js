// AI-assisted: see docs/AI_LOG.md #19, #24
import { PAYMENT_METHODS, TRIP_STATUS } from './trip';

export const HISTORY_CONFIG = {
  pageSize: 20, // the guide: paginate or limit the query (20 trips per load)
  requestTimeoutMs: 10000,
  // Finished trips: completed (payment pending) and paid. Cancelled/rejected are not rides.
  statuses: [TRIP_STATUS.completed, TRIP_STATUS.paid],
};

export const PERIODS = {
  today: 'today',
  week: 'week',
  month: 'month',
  range: 'range',
};

// "label" stays in Spanish for reference; screens show t(labelKey) through translateOptions
export const PERIOD_OPTIONS = [
  { value: PERIODS.today, label: 'Hoy', labelKey: 'period.today' },
  { value: PERIODS.week, label: 'Semana', labelKey: 'period.week' },
  { value: PERIODS.month, label: 'Mes', labelKey: 'period.month' },
  { value: PERIODS.range, label: 'Rango', labelKey: 'period.range' },
];

// The earnings screen uses the 3 fixed periods of the guide
export const EARNINGS_PERIOD_OPTIONS = PERIOD_OPTIONS.filter((option) => option.value !== PERIODS.range);

export const PAYMENT_FILTER_OPTIONS = [
  { value: null, label: 'Todos', labelKey: 'filter.all' },
  { value: PAYMENT_METHODS.mercadopago, label: 'Tarjeta', labelKey: 'filter.card' },
  { value: PAYMENT_METHODS.cash, label: 'Efectivo', labelKey: 'filter.cash' },
];