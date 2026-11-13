// AI-assisted: see docs/AI_LOG.md #15, #23, #24
import { VEHICLE_CATEGORY_OPTIONS } from '../config/registration';
import { PAYMENT_METHODS } from '../config/trip';
import { defaultT } from '../i18n';

// 19200 -> "$19.200"; -1200 -> "-$1.200" (whole Colombian pesos)
export function formatCop(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const digits = String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits}`;
}

// Translated payment method ('cash' -> 'Efectivo' / 'Cash'); '—' when unknown
export function paymentMethodLabel(method, t = defaultT) {
  return Object.values(PAYMENT_METHODS).includes(method) ? t(`payment.method.${method}`) : '—';
}

// Translated vehicle category ('economy' -> 'Económico' / 'Economy'); the raw value when unknown
export function categoryLabel(value, t = defaultT) {
  const option = VEHICLE_CATEGORY_OPTIONS.find((item) => item.value === value);
  return option ? t(option.labelKey) : value;
}