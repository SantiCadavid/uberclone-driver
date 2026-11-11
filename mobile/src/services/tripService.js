// AI-assisted: see docs/AI_LOG.md #14
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import { db } from './firebase';
import { getRoute, reverseGeocode } from './routingService';
import { calculateFare } from '../utils/calculateFare';
import { offsetCoordinate, randomBetween } from '../utils/geo';
import { withTimeout } from '../utils/withTimeout';
import { PRICING } from '../config/pricing';
import { SIMULATED_PASSENGERS, TRIP_CONFIG, TRIP_STATUS } from '../config/trip';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const toPlace = ({ latitude, longitude }, address) => ({ lat: latitude, lng: longitude, address });

// Simulated passenger: creates a "requested" trip near the driver
export async function createSimulatedTrip({ driver, paymentMethod }) {
  const { granted } = await Location.getForegroundPermissionsAsync();
  if (!granted) throw new Error('location-permission');
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const driverLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  const { simulatedPickupKm, simulatedTripKm } = TRIP_CONFIG;
  const origin = offsetCoordinate(
    driverLocation,
    randomBetween(simulatedPickupKm.min, simulatedPickupKm.max),
    randomBetween(0, 360),
  );
  const destination = offsetCoordinate(
    origin,
    randomBetween(simulatedTripKm.min, simulatedTripKm.max),
    randomBetween(0, 360),
  );

  // Only one routing call per request (the guide: never on every location update)
  const route = await getRoute(origin, destination);
  const originAddress = await reverseGeocode(origin);
  await wait(TRIP_CONFIG.geocodingDelayMs); // respect Nominatim's 1 request per second
  const destinationAddress = await reverseGeocode(destination);

  const estimate = calculateFare({
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    category: driver.vehicle.category,
  });

  const trip = {
    driverId: driver.id,
    passengerId: 'simulated-passenger',
    passengerName: randomItem(SIMULATED_PASSENGERS),
    origin: toPlace(origin, originAddress),
    destination: toPlace(destination, destinationAddress),
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    category: driver.vehicle.category,
    paymentMethod,
    estimatedFare: estimate.fare,
    estimatedDriverEarnings: estimate.driverEarnings,
    commissionRate: PRICING.commissionRate, // saved so a future rate change never alters history
    fare: null,
    commission: null,
    tip: 0,
    driverEarnings: null,
    paymentStatus: null,
    paymentId: null,
    status: TRIP_STATUS.requested,
    routePath: route.path,
    rating: null,
    createdAt: serverTimestamp(),
    acceptedAt: null,
    completedAt: null,
  };

  const reference = await withTimeout(
    addDoc(collection(db, 'trips'), trip),
    TRIP_CONFIG.routingTimeoutMs,
  );
  return reference.id;
}

export function getSimulatorErrorMessage(error) {
  switch (error?.message) {
    case 'location-permission':
      return 'Activa el permiso de ubicación para simular una solicitud cerca de ti.';
    case 'route-not-found':
      return 'No se encontró una ruta para los puntos generados. Inténtalo de nuevo.';
    case 'route-unavailable':
    case 'timeout':
      return 'El servicio de rutas no respondió. Revisa tu conexión e inténtalo de nuevo.';
    default:
      return 'No se pudo crear la solicitud. Inténtalo de nuevo.';
  }
}