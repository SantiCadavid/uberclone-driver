// AI-assisted: see docs/AI_LOG.md #14
// Free services allowed by the guide: OSRM (routes) and Nominatim (addresses).
// Google Directions / Distance Matrix are "Legacy" and cannot be enabled in new projects.
import { withTimeout } from '../utils/withTimeout';
import { TRIP_CONFIG } from '../config/trip';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

// Driving route between two points: distance, duration and the path to draw with Polyline
export async function getRoute(from, to) {
  const url =
    `${OSRM_URL}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    '?overview=simplified&geometries=geojson';
  const response = await withTimeout(fetch(url), TRIP_CONFIG.routingTimeoutMs);
  if (!response.ok) throw new Error('route-unavailable');

  const data = await response.json();
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) throw new Error('route-not-found');

  return {
    distanceKm: Math.round(route.distance / 100) / 10, // meters -> km with 1 decimal
    durationMin: Math.max(1, Math.round(route.duration / 60)), // seconds -> whole minutes
    // GeoJSON uses [lng, lat]; react-native-maps uses { latitude, longitude }
    path: route.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
  };
}

// Coordinates -> short readable address. Falls back to the coordinates if the service fails.
export async function reverseGeocode({ latitude, longitude }) {
  const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  try {
    const url =
      `${NOMINATIM_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}` +
      '&zoom=17&accept-language=es';
    const response = await withTimeout(
      fetch(url, { headers: { 'User-Agent': 'UberCloneDriver/1.0 (academic project)' } }),
      TRIP_CONFIG.routingTimeoutMs,
    );
    if (!response.ok) return fallback;
    const data = await response.json();
    return data.display_name?.split(',').slice(0, 3).join(',').trim() || fallback;
  } catch (error) {
    return fallback;
  }
}