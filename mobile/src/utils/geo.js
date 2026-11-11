// AI-assisted: see docs/AI_LOG.md #14
const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = 111.32;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Straight-line distance between two points (Haversine formula)
export function haversineKm(from, to) {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Point located "distanceKm" away from "origin" in the direction "bearingDegrees" (0 = north)
export function offsetCoordinate({ latitude, longitude }, distanceKm, bearingDegrees) {
  const bearing = toRadians(bearingDegrees);
  const dLat = (distanceKm * Math.cos(bearing)) / KM_PER_DEGREE_LAT;
  const dLng =
    (distanceKm * Math.sin(bearing)) / (KM_PER_DEGREE_LAT * Math.cos(toRadians(latitude)));
  return { latitude: latitude + dLat, longitude: longitude + dLng };
}

export function randomBetween(min, max) {
  return min + (max - min) * Math.random();
}