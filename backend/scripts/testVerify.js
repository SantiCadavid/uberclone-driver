// AI-assisted: see docs/AI_LOG.md #17
// Development tool: looks up the trip's payment in Mercado Pago and applies it to Firestore
import { verifyTripPayment } from '../src/payments.js';

const tripId = process.argv[2];
if (!tripId) {
  console.error('Usage: npm run pay:verify -- <tripId>');
  process.exit(1);
}

try {
  const result = await verifyTripPayment(tripId);
  console.log(result);
  process.exit(0);
} catch (error) {
  console.error('Error:', error.code ?? error.message);
  process.exit(1);
}