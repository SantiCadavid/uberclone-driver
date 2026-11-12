// AI-assisted: see docs/AI_LOG.md #17
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { config } from './config.js';

const client = new MercadoPagoConfig({
  accessToken: config.mpAccessToken,
  options: { timeout: 10000 },
});
const preferences = new Preference(client);
const payments = new Payment(client);

// Checkout Pro preference for a completed trip. The amount comes from the database.
export async function createTripPreference(tripId, trip) {
  const returnUrl = `${config.publicUrl}/payments/return?tripId=${encodeURIComponent(tripId)}`;
  const result = await preferences.create({
    body: {
      items: [
        {
          id: tripId,
          title: 'Viaje UberClone',
          description: `${trip.origin.address} → ${trip.destination.address}`.slice(0, 250),
          quantity: 1,
          unit_price: trip.fare,
          currency_id: 'COP',
        },
      ],
      external_reference: tripId, // links the payment back to the trip
      back_urls: { success: returnUrl, failure: returnUrl, pending: returnUrl },
      auto_return: 'approved',
      notification_url: `${config.publicUrl}/payments/webhook`,
    },
  });
  return { preferenceId: result.id, initPoint: result.init_point };
}

export function getPayment(paymentId) {
  return payments.get({ id: paymentId });
}

// Latest payment of a trip (an approved one wins if there are several attempts)
export async function findLatestPaymentForTrip(tripId) {
  const result = await payments.search({
    options: { external_reference: tripId, sort: 'date_created', criteria: 'desc' },
  });
  const list = result.results ?? [];
  return list.find((payment) => payment.status === 'approved') ?? list[0] ?? null;
}