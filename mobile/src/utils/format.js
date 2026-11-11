// AI-assisted: see docs/AI_LOG.md #15
import { VEHICLE_CATEGORY_OPTIONS } from '../config/registration';

// 19200 -> "$19.200"; -1200 -> "-$1.200" (whole Colombian pesos)
export function formatCop(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const digits = String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits}`;
}

export const PAYMENT_METHOD_LABELS = {
  mercadopago: 'Tarjeta (Mercado Pago)',
  cash: 'Efectivo',
};

export function categoryLabel(value) {
  return VEHICLE_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}