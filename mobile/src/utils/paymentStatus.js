// AI-assisted: see docs/AI_LOG.md #18
import { PAYMENT_STATUS } from '../config/payment';
import { PAYMENT_METHODS, TRIP_STATUS } from '../config/trip';

const PENDING_ALIASES = ['pending', 'in_process', 'authorized', 'in_mediation'];
const REJECTED_ALIASES = ['rejected', 'cancelled', 'refunded', 'charged_back'];

// Maps any value (including raw Mercado Pago statuses) to one of the 4 app statuses, or null.
export function normalizePaymentStatus(rawStatus) {
  if (typeof rawStatus !== 'string') return null;
  const value = rawStatus.trim().toLowerCase();
  if (value === PAYMENT_STATUS.APPROVED) return PAYMENT_STATUS.APPROVED;
  if (value === PAYMENT_STATUS.CASH) return PAYMENT_STATUS.CASH;
  if (PENDING_ALIASES.includes(value)) return PAYMENT_STATUS.PENDING;
  if (REJECTED_ALIASES.includes(value)) return PAYMENT_STATUS.REJECTED;
  return null;
}

const STATUS_INFO = {
  [PAYMENT_STATUS.APPROVED]: { label: 'Aprobado', tone: 'success' },
  [PAYMENT_STATUS.PENDING]: { label: 'Pendiente', tone: 'warning' },
  [PAYMENT_STATUS.REJECTED]: { label: 'Rechazado', tone: 'danger' },
  [PAYMENT_STATUS.CASH]: { label: 'Efectivo', tone: 'success' },
};

// Returns { status, label, tone }. The screen maps tone to a color in theme/colors.js.
export function getPaymentStatusInfo(rawStatus) {
  const status = normalizePaymentStatus(rawStatus);
  if (!status) return { status: null, label: 'Sin cobrar', tone: 'neutral' };
  return { status, ...STATUS_INFO[status] };
}

// Decides which collection buttons the driver can use for a trip.
// Also used by the cash transaction, so the screen and the database follow the same rule.
export function getCollectionActions(trip) {
  const none = { canPayWithCard: false, canVerify: false, canMarkCash: false };
  if (!trip || trip.status !== TRIP_STATUS.completed) return none;

  const status = normalizePaymentStatus(trip.paymentStatus);
  const isCard = trip.paymentMethod === PAYMENT_METHODS.mercadopago;

  if (isCard) {
    return {
      canPayWithCard: status === null || status === PAYMENT_STATUS.REJECTED,
      canVerify: status === PAYMENT_STATUS.PENDING,
      // Cash only as an alternative after a rejected card payment (never while pending)
      canMarkCash: status === PAYMENT_STATUS.REJECTED,
    };
  }

  return { ...none, canMarkCash: status === null };
}