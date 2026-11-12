// AI-assisted: see docs/AI_LOG.md #17
import { db, FieldValue } from './firebaseAdmin.js';
import { HttpError } from './errors.js';
import { findLatestPaymentForTrip } from './mercadoPago.js';

// Mercado Pago status -> our paymentStatus (Aprobado, Pendiente, Rechazado)
const PAYMENT_STATUS = {
  approved: 'approved',
  authorized: 'pending',
  in_process: 'pending',
  in_mediation: 'pending',
  pending: 'pending',
  rejected: 'rejected',
  cancelled: 'rejected',
  refunded: 'rejected',
  charged_back: 'rejected',
};

export async function loadTrip(tripId) {
  const snapshot = await db.collection('trips').doc(tripId).get();
  if (!snapshot.exists) throw new HttpError(404, 'trip-not-found');
  return snapshot.data();
}

export function assertPayableTrip(trip) {
  if (trip.status !== 'completed') throw new HttpError(409, 'trip-not-completed');
  if (trip.paymentMethod !== 'mercadopago') throw new HttpError(409, 'trip-not-card');
  if (!Number.isInteger(trip.fare) || trip.fare <= 0) throw new HttpError(409, 'trip-without-fare');
}

// Applies a Mercado Pago payment to the trip. Idempotent: running it twice
// (webhook + verification) never pays a trip or adds to the balance twice.
export async function applyPaymentResult(tripId, payment) {
  const paymentStatus = PAYMENT_STATUS[payment.status] ?? 'pending';
  const tripRef = db.collection('trips').doc(tripId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists) throw new HttpError(404, 'trip-not-found');
    const trip = snapshot.data();

    if (trip.status === 'paid') return { paymentStatus: trip.paymentStatus, alreadyPaid: true };

    const changes = {
      paymentStatus,
      paymentId: String(payment.id),
      paymentUpdatedAt: FieldValue.serverTimestamp(),
    };

    if (paymentStatus === 'approved') {
      // Never accept a payment that does not match the trip's fare
      if (Math.round(payment.transaction_amount) !== trip.fare) {
        throw new HttpError(409, 'amount-mismatch');
      }
      changes.status = 'paid';
      changes.paidAt = FieldValue.serverTimestamp();
      // Balance: gateway trips add the driver's net earnings
      transaction.update(db.collection('drivers').doc(trip.driverId), {
        balance: FieldValue.increment(trip.driverEarnings),
      });
    }

    transaction.update(tripRef, changes);
    return { paymentStatus };
  });
}

// Used when the passenger returns from the checkout (or if the webhook did not arrive)
export async function verifyTripPayment(tripId) {
  const payment = await findLatestPaymentForTrip(tripId);
  if (!payment) return { paymentStatus: 'pending', found: false };
  const result = await applyPaymentResult(tripId, payment);
  return { ...result, found: true };
}