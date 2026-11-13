// AI-assisted: see docs/AI_LOG.md #17, #26
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { requireAuth } from './auth.js';
import { HttpError } from './errors.js';
import { createTripPreference, getPayment } from './mercadoPago.js';
import {
  applyCashPayment,
  applyPaymentResult,
  assertPayableTrip,
  loadTrip,
  verifyTripPayment,
} from './payments.js';

const app = express();
app.use(cors());
app.use(express.json());

// Lets async route errors reach the error handler
const asyncHandler = (handler) => (req, res, next) => handler(req, res, next).catch(next);

const readTripId = (body) => {
  const tripId = body?.tripId;
  if (typeof tripId !== 'string' || tripId.length === 0) throw new HttpError(400, 'missing-trip-id');
  return tripId;
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Step 2-3 of the guide: the app sends tripId + amount; the backend creates the preference
app.post(
  '/payments/preference',
  requireAuth,
  asyncHandler(async (req, res) => {
    const tripId = readTripId(req.body);
    const trip = await loadTrip(tripId);
    if (trip.driverId !== req.uid) throw new HttpError(403, 'trip-not-yours');
    assertPayableTrip(trip);
    // The amount always comes from the database; the app's value is only cross-checked
    if (req.body.amount !== undefined && Number(req.body.amount) !== trip.fare) {
      throw new HttpError(409, 'amount-mismatch');
    }
    res.json(await createTripPreference(tripId, trip));
  }),
);

// The app asks the backend to check the payment (when returning from the checkout)
app.post(
  '/payments/verify',
  requireAuth,
  asyncHandler(async (req, res) => {
    const tripId = readTripId(req.body);
    const trip = await loadTrip(tripId);
    if (trip.driverId !== req.uid) throw new HttpError(403, 'trip-not-yours');
    res.json(await verifyTripPayment(tripId));
  }),
);

// Cash collected by the driver: the server marks the trip paid and takes the commission from the balance
app.post(
  '/payments/cash',
  requireAuth,
  asyncHandler(async (req, res) => {
    const tripId = readTripId(req.body);
    res.json(await applyCashPayment(tripId, req.uid));
  }),
);

// Step 5 of the guide: Mercado Pago notifies the payment result
app.post(
  '/payments/webhook',
  asyncHandler(async (req, res) => {
    const type = req.body?.type ?? req.query.type ?? req.query.topic;
    const paymentId = req.body?.data?.id ?? req.query['data.id'] ?? req.query.id;
    if (type === 'payment' && paymentId) {
      const payment = await getPayment(paymentId);
      if (payment.external_reference) {
        const result = await applyPaymentResult(payment.external_reference, payment);
        console.log(`Webhook: trip ${payment.external_reference} -> ${result.paymentStatus}`);
      }
    }
    res.sendStatus(200);
  }),
);

// back_urls: page shown to the passenger after paying
app.get('/payments/return', (req, res) => {
  res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Pago procesado</title></head>
<body style="font-family:sans-serif;text-align:center;padding:48px">
<h2>Pago procesado</h2><p>Puedes cerrar esta ventana y volver a la app.</p></body></html>`);
});

// Error handler: short codes for the app, details only in the server log
app.use((error, req, res, next) => {
  const status = error instanceof HttpError ? error.status : 502;
  const code = error instanceof HttpError ? error.code : 'payment-provider-error';
  if (!(error instanceof HttpError)) console.error(error);
  res.status(status).json({ error: code });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
  console.log(`Public URL: ${config.publicUrl}`);
});