// AI-assisted: see docs/AI_LOG.md #19
import { filterTripsByRange, summarizeEarnings } from '../earnings';

const cashTrip = { id: 'a', fare: 11800, commission: 2360, tip: 0, driverEarnings: 9440, paymentStatus: 'cash', completedAtMs: 100 };
const cardTrip = { id: 'b', fare: 12700, commission: 2540, tip: 0, driverEarnings: 10160, paymentStatus: 'approved', completedAtMs: 200 };

describe('summarizeEarnings', () => {
  test('no trips gives zeros (never NaN)', () => {
    expect(summarizeEarnings([])).toEqual({
      tripCount: 0, totalBilled: 0, totalCommission: 0, totalTips: 0, netEarnings: 0, balanceChange: 0, averagePerTrip: 0,
    });
  });
  test('totals of the two real test trips (cash + card)', () => {
    expect(summarizeEarnings([cashTrip, cardTrip])).toEqual({
      tripCount: 2,
      totalBilled: 24500,
      totalCommission: 4900,
      totalTips: 0,
      netEarnings: 19600,
      balanceChange: 7800, // +10.160 card earnings - 2.360 cash commission
      averagePerTrip: 9800,
    });
  });
  test('tips go to the driver and are added up', () => {
    const tipped = { ...cardTrip, tip: 1000, driverEarnings: 11160 };
    expect(summarizeEarnings([tipped]).totalTips).toBe(1000);
  });
  test('average is rounded to whole pesos', () => {
    const trips = [1000, 1001, 1001].map((driverEarnings, index) => ({ id: String(index), driverEarnings }));
    expect(summarizeEarnings(trips).averagePerTrip).toBe(1001);
  });
});

describe('filterTripsByRange', () => {
  test('includes both ends of the range', () => {
    expect(filterTripsByRange([cashTrip, cardTrip], { startMs: 100, endMs: 200 })).toHaveLength(2);
    expect(filterTripsByRange([cashTrip, cardTrip], { startMs: 101, endMs: 200 })).toEqual([cardTrip]);
  });
  test('skips trips without completion time and returns [] without a range', () => {
    expect(filterTripsByRange([{ id: 'x' }], { startMs: 0, endMs: 999 })).toEqual([]);
    expect(filterTripsByRange([cashTrip], null)).toEqual([]);
  });
});