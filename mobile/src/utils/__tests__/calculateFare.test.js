// AI-assisted: see docs/AI_LOG.md #14
import { calculateFare } from '../calculateFare';
import { PRICING } from '../../config/pricing';

// Example from section 5 of the guide: 8.5 km and 22 minutes, no tip
const GUIDE_TRIP = { distanceKm: 8.5, durationMin: 22 };

describe('calculateFare', () => {
  test('guide example - Económico: 19.200 / 3.840 / 15.360', () => {
    const result = calculateFare({ ...GUIDE_TRIP, category: 'economy' });
    expect(result.fare).toBe(19200);
    expect(result.commission).toBe(3840);
    expect(result.driverEarnings).toBe(15360);
  });

  test('guide example - XL: 26.880 rounds to 26.900 / 5.380 / 21.520', () => {
    const result = calculateFare({ ...GUIDE_TRIP, category: 'xl' });
    expect(result.fare).toBe(26900);
    expect(result.commission).toBe(5380);
    expect(result.driverEarnings).toBe(21520);
  });

  test('Premium: 34.560 rounds to 34.600 / 6.920 / 27.680', () => {
    const result = calculateFare({ ...GUIDE_TRIP, category: 'premium' });
    expect(result.fare).toBe(34600);
    expect(result.commission).toBe(6920);
    expect(result.driverEarnings).toBe(27680);
  });

  test('short trip pays the minimum fare (6.000)', () => {
    const result = calculateFare({ distanceKm: 1, durationMin: 2, category: 'economy' });
    expect(result.fare).toBe(6000);
    expect(result.commission).toBe(1200);
    expect(result.driverEarnings).toBe(4800);
  });

  test('tip goes fully to the driver and is not part of the commission', () => {
    const result = calculateFare({ ...GUIDE_TRIP, category: 'economy', tip: 2000 });
    expect(result.commission).toBe(3840);
    expect(result.driverEarnings).toBe(17360);
  });

  test('rounds the fare to the nearest 100 before the commission', () => {
    // 3.500 + 8,3·1.200 + 17·250 = 17.710 -> 17.700
    const result = calculateFare({ distanceKm: 8.3, durationMin: 17, category: 'economy' });
    expect(result.fare).toBe(17700);
    expect(result.commission).toBe(3540);
  });

  test('uses the commission rate it receives (history keeps its own rate)', () => {
    const result = calculateFare(
      { ...GUIDE_TRIP, category: 'economy' },
      { ...PRICING, commissionRate: 0.25 },
    );
    expect(result.commission).toBe(4800);
    expect(result.driverEarnings).toBe(14400);
    expect(result.commissionRate).toBe(0.25);
  });

  test('rejects unknown categories and negative values', () => {
    expect(() => calculateFare({ ...GUIDE_TRIP, category: 'moto' })).toThrow();
    expect(() => calculateFare({ distanceKm: -1, durationMin: 5, category: 'economy' })).toThrow();
  });
});