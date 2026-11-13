// AI-assisted: see docs/AI_LOG.md #18, #23, #26
import { auth } from './firebase';
import { PAYMENT_CONFIG } from '../config/payment';
import { defaultT } from '../i18n';

// ---------- Backend (Mercado Pago and cash) ----------

// POST to our backend with the Firebase ID token. Secrets never live in the app:
// the backend verifies the token and is the only one that moves money.
async function postToBackend(path, body) {
  if (!PAYMENT_CONFIG.backendUrl) throw new Error('backend-not-configured');
  const user = auth.currentUser;
  if (!user) throw new Error('not-authenticated');
  const token = await user.getIdToken();

  // AbortController really cancels the request when time runs out
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAYMENT_CONFIG.requestTimeoutMs);
  let response;
  try {
    response = await fetch(`${PAYMENT_CONFIG.backendUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true', // skips the free ngrok warning page
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (requestError) {
    throw new Error(requestError?.name === 'AbortError' ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    data = null; // e.g. ngrok's HTML page when the tunnel is off
  }
  if (!response.ok) throw new Error(data?.error ?? 'backend-unavailable');
  if (!data) throw new Error('backend-unavailable');
  return data;
}

// Guide steps 2-3: the app sends tripId + amount; the backend takes the real amount from Firestore
export async function createPaymentPreference(trip) {
  const data = await postToBackend('/payments/preference', { tripId: trip.id, amount: trip.fare });
  const checkoutUrl = data.initPoint ?? data.init_point ?? data.sandboxInitPoint;
  // Only open https links that come from our backend
  if (typeof checkoutUrl !== 'string' || !checkoutUrl.startsWith('https://')) {
    throw new Error('invalid-preference');
  }
  return { checkoutUrl };
}

// Asks the backend to check the payment in Mercado Pago and apply it (idempotent)
export function verifyPayment(tripId) {
  return postToBackend('/payments/verify', { tripId });
}

// Cash: the backend marks the trip paid and takes the commission from the balance (idempotent).
// The Firestore rules do not let the app change the balance or mark a trip as paid.
export function registerCashPayment(tripId) {
  return postToBackend('/payments/cash', { tripId });
}

// ---------- Messages ----------

const PAYMENT_ERROR_KEYS = {
  'trip-not-completed': 'payment.error.notCompleted',
  'trip-not-card': 'payment.error.notCard',
  'amount-mismatch': 'payment.error.amountMismatch',
  'invalid-token': 'payment.error.session',
  'missing-token': 'payment.error.session',
  'not-authenticated': 'payment.error.session',
  'trip-not-yours': 'payment.error.notYours',
  'trip-not-found': 'payment.error.notFound',
  'cash-not-allowed': 'payment.error.cashNotAllowed',
  'trip-invalid-amounts': 'payment.error.invalidAmounts',
  'invalid-preference': 'payment.error.invalidPreference',
  'payment-provider-error': 'payment.error.provider',
  'backend-unavailable': 'payment.error.backendUnavailable',
  'backend-not-configured': 'payment.error.backendNotConfigured',
  'browser-error': 'payment.error.browser',
  network: 'payment.error.network',
  timeout: 'payment.error.timeout',
};

// Returns a translation key (the hook stores it; the screen translates it)
export function getPaymentErrorKey(error) {
  return PAYMENT_ERROR_KEYS[error?.message] ?? 'payment.error.unknown';
}

export function getPaymentErrorMessage(error, t = defaultT) {
  return t(getPaymentErrorKey(error));
}