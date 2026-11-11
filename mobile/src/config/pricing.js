// AI-assisted: see docs/AI_LOG.md #14
// Single place for every pricing value (teaching values from the guide, not real fares).
// All money values are whole Colombian pesos to avoid decimal errors.
export const PRICING = {
  baseFare: 3500,
  perKm: 1200,
  perMinute: 250,
  minimumFare: 6000,
  categoryMultipliers: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
  commissionRate: 0.2, // 20 % platform commission; tips go fully to the driver
  roundTo: 100, // fare is rounded to the nearest 100 COP before the commission
};