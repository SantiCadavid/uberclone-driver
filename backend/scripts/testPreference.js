// AI-assisted: see docs/AI_LOG.md #17
// Development tool: creates the payment link of a completed card trip
import { assertPayableTrip, loadTrip } from '../src/payments.js';
import { createTripPreference } from '../src/mercadoPago.js';

const tripId = process.argv[2];
if (!tripId) {
  console.error('Usage: npm run pay:preference -- <tripId>');
  process.exit(1);
}

try {
  const trip = await loadTrip(tripId);
  assertPayableTrip(trip);
  const { preferenceId, initPoint } = await createTripPreference(tripId, trip);
  console.log(`Trip fare: ${trip.fare} COP`);
  console.log(`Preference: ${preferenceId}`);
  console.log('Open this link in an incognito window and log in with the BUYER test account:');
  console.log(initPoint);
  process.exit(0);
} catch (error) {
  console.error('Error:', error.code ?? error.message);
  process.exit(1);
}