// AI-assisted: see docs/AI_LOG.md #19
import { PAYMENT_STATUS } from '../config/payment';

// Missing amounts count as 0 so one bad document never breaks the totals
const amount = (value) => (Number.isFinite(value) ? value : 0);

// Trips whose completion time is inside the range (both ends included)
export function filterTripsByRange(trips, range) {
  if (!range) return [];
  return trips.filter(
    (trip) =>
      typeof trip.completedAtMs === 'number' &&
      trip.completedAtMs >= range.startMs &&
      trip.completedAtMs <= range.endMs,
  );
}

// Totals of a list of PAID trips, in whole pesos
export function summarizeEarnings(trips) {
  const totals = trips.reduce(
    (acc, trip) => {
      const isCash = trip.paymentStatus === PAYMENT_STATUS.CASH;
      acc.tripCount += 1;
      acc.totalBilled += amount(trip.fare);
      acc.totalCommission += amount(trip.commission);
      acc.totalTips += amount(trip.tip);
      acc.netEarnings += amount(trip.driverEarnings);
      // The guide: balance = earnings of gateway-paid trips - commissions of cash trips
      acc.balanceChange += isCash ? -amount(trip.commission) : amount(trip.driverEarnings);
      return acc;
    },
    { tripCount: 0, totalBilled: 0, totalCommission: 0, totalTips: 0, netEarnings: 0, balanceChange: 0 },
  );
  return {
    ...totals,
    averagePerTrip: totals.tripCount > 0 ? Math.round(totals.netEarnings / totals.tripCount) : 0,
  };
}