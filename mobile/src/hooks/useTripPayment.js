// AI-assisted: see docs/AI_LOG.md #18
import { useCallback, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  createPaymentPreference,
  getPaymentErrorMessage,
  registerCashPayment,
  verifyPayment,
} from '../services/paymentService';
import { normalizePaymentStatus } from '../utils/paymentStatus';
import { withTimeout } from '../utils/withTimeout';
import { TRIP_CONFIG } from '../config/trip';
import { PAYMENT_STATUS } from '../config/payment';

const VERIFY_MESSAGES = {
  [PAYMENT_STATUS.APPROVED]: { type: 'success', text: 'Pago aprobado por Mercado Pago.' },
  [PAYMENT_STATUS.PENDING]: { type: 'info', text: 'El pago quedó pendiente. Toca "Verificar pago" en unos minutos.' },
  [PAYMENT_STATUS.REJECTED]: { type: 'error', text: 'El pago fue rechazado. Puedes reintentar o cobrar en efectivo.' },
};
// When the answer has no known status we never invent a result: Firestore shows the real one
const VERIFY_DONE = { type: 'info', text: 'Verificación terminada. El estado del pago se muestra arriba.' };

const verifyMessage = (result) => VERIFY_MESSAGES[normalizePaymentStatus(result?.paymentStatus)] ?? VERIFY_DONE;

// Custom hook: the collection actions of a trip. The screen only calls these functions.
export function useTripPayment(trip, driverId) {
  const [busyAction, setBusyAction] = useState(null); // 'card' | 'verify' | 'cash' | null
  const [message, setMessage] = useState(null);
  const tripId = trip?.id ?? null;

  // A different trip starts without old messages
  useEffect(() => {
    setMessage(null);
  }, [tripId]);

  const run = useCallback(async (name, action) => {
    setBusyAction(name);
    setMessage(null);
    try {
      setMessage(await action());
    } catch (actionError) {
      setMessage({ type: 'error', text: getPaymentErrorMessage(actionError) });
    } finally {
      setBusyAction(null);
    }
  }, []);

  const payWithCard = useCallback(
    () =>
      run('card', async () => {
        const { checkoutUrl } = await createPaymentPreference(trip);
        try {
          // Resolves when the browser is closed
          await WebBrowser.openBrowserAsync(checkoutUrl);
        } catch (browserError) {
          throw new Error('browser-error');
        }
        // Back from the checkout: ask the backend to check the payment (the webhook may also arrive)
        return verifyMessage(await verifyPayment(trip.id));
      }),
    [run, trip],
  );

  const verify = useCallback(
    () => run('verify', async () => verifyMessage(await verifyPayment(tripId))),
    [run, tripId],
  );

  const markCash = useCallback(
    () =>
      run('cash', async () => {
        await withTimeout(registerCashPayment(tripId, driverId), TRIP_CONFIG.actionTimeoutMs);
        return { type: 'success', text: 'Cobro en efectivo registrado.' };
      }),
    [run, tripId, driverId],
  );

  return { busyAction, busy: busyAction !== null, message, payWithCard, verify, markCash };
}