// AI-assisted: see docs/AI_LOG.md #14
import { haversineKm, offsetCoordinate } from '../geo';

describe('geo', () => {
  test('one degree of latitude is about 111 km', () => {
    const from = { latitude: 6, longitude: -75 };
    const to = { latitude: 7, longitude: -75 };
    expect(haversineKm(from, to)).toBeCloseTo(111.2, 0);
  });

  test('offsetCoordinate moves the requested distance', () => {
    const origin = { latitude: 6.2442, longitude: -75.5812 };
    const point = offsetCoordinate(origin, 2, 45);
    expect(haversineKm(origin, point)).toBeCloseTo(2, 1);
  });
});