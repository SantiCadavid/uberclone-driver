// AI-assisted: see docs/AI_LOG.md #18
// Payment configuration. Values stored in Firestore are in English;
// UI labels live in src/utils/paymentStatus.js.

export const PAYMENT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CASH: 'cash',
};

export const PAYMENT_CONFIG = {
  // Public backend URL (not a secret). Defined in mobile/.env
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
  // Max wait for backend requests before showing an error
  requestTimeoutMs: 15000,
};