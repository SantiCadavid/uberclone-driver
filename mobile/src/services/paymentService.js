// AI-assisted: see docs/AI_LOG.md #18
import { doc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { PAYMENT_CONFIG, PAYMENT_STATUS } from '../config/payment';
import { PAYMENT_METHODS, TRIP_STATUS } from '../config/trip';
import { getCollectionActions } from '../utils/paymentStatus';

// ---------- Backend (Mercado Pago) ----------

// POST to our backend with the Firebase ID token. Secrets never live in the app:
// the backend verifies the token and talks to Mercado Pago with its own access token.
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

// ---------- Cash ----------

// Transaction: the trip and the balance change together or not at all
export async function registerCashPayment(tripId, driverId) {
  const tripRef = doc(db, 'trips', tripId);
  const driverRef = doc(db, 'drivers', driverId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists()) throw new Error('trip-not-found');
    const trip = snapshot.data();
    if (trip.driverId !== driverId) throw new Error('trip-not-yours');
    // Same rule as the buttons, checked again on fresh data (double tap, webhook meanwhile)
    if (!getCollectionActions(trip).canMarkCash) throw new Error('cash-not-allowed');
    if (!Number.isInteger(trip.commission)) throw new Error('trip-invalid-amounts');

    transaction.update(tripRef, {
      status: TRIP_STATUS.paid,
      paymentStatus: PAYMENT_STATUS.CASH,
      paymentMethod: PAYMENT_METHODS.cash,
      // Keeps track of a card payment that was rejected and then collected in cash
      ...(trip.paymentMethod !== PAYMENT_METHODS.cash && { paymentMethodChangedFrom: trip.paymentMethod }),
      paidAt: serverTimestamp(),
      paymentUpdatedAt: serverTimestamp(),
    });
    // The platform did not receive the money: its commission comes out of the balance (may go negative)
    transaction.update(driverRef, {
      balance: increment(-trip.commission),
      updatedAt: serverTimestamp(),
    });
  });
}

// ---------- Messages ----------

const SESSION_EXPIRED = 'Tu sesión expiró. Cierra sesión e ingresa de nuevo.';

const PAYMENT_ERROR_MESSAGES = {
  'trip-not-completed': 'El viaje aún no está finalizado; todavía no se puede cobrar.',
  'trip-not-card': 'Este viaje no es con tarjeta. Usa "Efectivo recibido".',
  'amount-mismatch': 'El monto no coincide con el registrado en el servidor. Vuelve a abrir el viaje.',
  'invalid-token': SESSION_EXPIRED,
  'missing-token': SESSION_EXPIRED,
  'not-authenticated': SESSION_EXPIRED,
  'trip-not-yours': 'Este viaje no está asignado a ti.',
  'trip-not-found': 'El viaje ya no existe.',
  'cash-not-allowed': 'El cobro ya se registró o hay un pago con tarjeta en curso. Revisa el estado del pago.',
  'trip-invalid-amounts': 'El viaje no tiene los montos calculados; no se puede registrar el cobro.',
  'invalid-preference': 'El servidor de pagos no entregó un link de pago válido. Inténtalo de nuevo.',
  'payment-provider-error': 'Mercado Pago no respondió. Inténtalo de nuevo en unos segundos.',
  'backend-unavailable': 'El servidor de pagos no está disponible. Inténtalo de nuevo en unos minutos.',
  'backend-not-configured': 'La app no tiene configurado el servidor de pagos.',
  'browser-error': 'No se pudo abrir el pago. Inténtalo de nuevo.',
  network: 'Sin conexión con el servidor de pagos. Revisa tu internet.',
  timeout: 'El servidor de pagos no respondió a tiempo. Inténtalo de nuevo.',
};

export function getPaymentErrorMessage(error) {
  return PAYMENT_ERROR_MESSAGES[error?.message] ?? 'No se pudo procesar el cobro. Inténtalo de nuevo.';
}