// AI-assisted: see docs/AI_LOG.md #14
import { PRICING } from '../config/pricing';

const roundToNearest = (value, step) => Math.round(value / step) * step;

const isValidNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

// Pure function used both for the passenger's estimate and for closing the driver's trip.
// "pricing" is a parameter so a trip can be recalculated with the rate it was created with.
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }, pricing = PRICING) {
  const multiplier = pricing.categoryMultipliers[category];
  if (multiplier === undefined) throw new Error(`Unknown category: ${category}`);
  if (!isValidNumber(distanceKm) || !isValidNumber(durationMin) || !isValidNumber(tip)) {
    throw new Error('Distance, duration and tip must be numbers >= 0');
  }

  const rawFare =
    (pricing.baseFare + distanceKm * pricing.perKm + durationMin * pricing.perMinute) * multiplier;
  // Tarifa = max(Mínima, (Base + km·Vkm + min·Vmin)·M), rounded to 100 COP
  const fare = roundToNearest(Math.max(pricing.minimumFare, rawFare), pricing.roundTo);
  const commission = Math.round(fare * pricing.commissionRate);
  const tipCop = Math.round(tip);
  const driverEarnings = fare - commission + tipCop;

  return {
    fare,
    commission,
    tip: tipCop,
    driverEarnings,
    commissionRate: pricing.commissionRate,
  };
}