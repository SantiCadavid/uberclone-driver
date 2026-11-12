// AI-assisted: see docs/AI_LOG.md #19
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

export const PERIOD_OPTIONS = [
  { value: PERIODS.today, label: 'Hoy' },
  { value: PERIODS.week, label: 'Semana' },
  { value: PERIODS.month, label: 'Mes' },
  { value: PERIODS.range, label: 'Rango' },
];

// The earnings screen uses the 3 fixed periods of the guide
export const EARNINGS_PERIOD_OPTIONS = PERIOD_OPTIONS.filter((option) => option.value !== PERIODS.range);

export const PAYMENT_FILTER_OPTIONS = [
  { value: null, label: 'Todos' },
  { value: PAYMENT_METHODS.mercadopago, label: 'Tarjeta' },
  { value: PAYMENT_METHODS.cash, label: 'Efectivo' },
];