// AI-assisted: see docs/AI_LOG.md #14, #15, #16
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import * as Location from 'expo-location';
import { db } from './firebase';
import { getRoute, reverseGeocode } from './routingService';
import { calculateFare } from '../utils/calculateFare';
import { offsetCoordinate, randomBetween } from '../utils/geo';
import { withTimeout } from '../utils/withTimeout';
import { PRICING } from '../config/pricing';
import {
  ACTIVE_TRIP_STATUSES,
  SIMULATED_PASSENGERS,
  TRIP_CONFIG,
  TRIP_STATUS,
} from '../config/trip';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

const toPlace = ({ latitude, longitude }, address) => ({ lat: latitude, lng: longitude, address });

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

const createdAtMs = (trip) => trip.createdAt?.toMillis?.() ?? 0;

const withId = (snapshot) => ({
  id: snapshot.id,
  // "estimate" gives a usable timestamp while the server value is still pending
  ...snapshot.data({ serverTimestamps: 'estimate' }),
});

// ---------- Simulated passenger ----------

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

// ---------- Incoming requests ----------

// Real-time listener of this driver's pending requests, oldest first.
// Returns the unsubscribe function for the useEffect cleanup.
export function subscribeToTripRequests(driverId, onData, onError) {
  const requestsQuery = query(
    collection(db, 'trips'),
    where('driverId', '==', driverId),
    where('status', '==', TRIP_STATUS.requested),
  );
  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      const requests = snapshot.docs.map(withId).sort((a, b) => createdAtMs(a) - createdAtMs(b));
      onData(requests);
    },
    onError,
  );
}

// Transaction: reads and writes atomically, so a request can never be accepted twice
// or accepted after being rejected or cancelled
export async function acceptTrip(tripId, driverId) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists()) throw new Error('trip-not-found');
    const trip = snapshot.data();
    if (trip.driverId !== driverId) throw new Error('trip-not-yours');
    if (trip.status !== TRIP_STATUS.requested) throw new Error('trip-not-available');
    transaction.update(tripRef, {
      status: TRIP_STATUS.accepted,
      acceptedAt: serverTimestamp(),
    });
  });
}

// reason: "rejected" (driver tapped Reject) or "expired" (the 15 s ran out)
export async function rejectTrip(tripId, reason) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists()) throw new Error('trip-not-found');
    if (snapshot.data().status !== TRIP_STATUS.requested) throw new Error('trip-not-available');
    transaction.update(tripRef, {
      status: TRIP_STATUS.rejected,
      rejectionReason: reason,
      rejectedAt: serverTimestamp(),
    });
  });
}

// ---------- Active trip ----------

// Real-time listener of the driver's current trip (accepted ... completed). Null when none.
export function subscribeToActiveTrip(driverId, onData, onError) {
  const activeQuery = query(
    collection(db, 'trips'),
    where('driverId', '==', driverId),
    where('status', 'in', ACTIVE_TRIP_STATUSES),
  );
  return onSnapshot(
    activeQuery,
    (snapshot) => {
      const trips = snapshot.docs.map(withId).sort((a, b) => createdAtMs(b) - createdAtMs(a));
      onData(trips[0] ?? null);
    },
    onError,
  );
}

// Changes a trip only if its current status is one of "allowedFrom".
// Protects against double taps and against changes made meanwhile (e.g. passenger cancelled).
async function transitionTrip(tripId, allowedFrom, changes) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists()) throw new Error('trip-not-found');
    if (!allowedFrom.includes(snapshot.data().status)) throw new Error('trip-invalid-state');
    transaction.update(tripRef, changes);
  });
}

// accepted -> driver_arriving. The route to the pickup is calculated once, when accepting.
// Returns false if the route could not be calculated (the trip still moves on).
export async function startPickup(trip, driverLocation) {
  let pickupRoute = null;
  if (driverLocation) {
    try {
      pickupRoute = await getRoute(driverLocation, toLatLng(trip.origin));
    } catch (routeError) {
      pickupRoute = null;
    }
  }
  await transitionTrip(trip.id, [TRIP_STATUS.accepted], {
    status: TRIP_STATUS.driverArriving,
    pickupRoute,
    driverArrivingAt: serverTimestamp(),
  });
  return Boolean(pickupRoute);
}

// driver_arriving -> in_progress ("Pasajero a bordo")
export function startTrip(tripId) {
  return transitionTrip(tripId, [TRIP_STATUS.driverArriving], {
    status: TRIP_STATUS.inProgress,
    startedAt: serverTimestamp(),
  });
}

// in_progress -> completed. Final fare with the SAME function used for the estimate,
// and with the commission rate saved in the trip (never the current one)
export function finishTrip(trip) {
  const result = calculateFare(
    {
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      category: trip.category,
      tip: trip.tip ?? 0,
    },
    { ...PRICING, commissionRate: trip.commissionRate },
  );
  return transitionTrip(trip.id, [TRIP_STATUS.inProgress], {
    status: TRIP_STATUS.completed,
    fare: result.fare,
    commission: result.commission,
    tip: result.tip,
    driverEarnings: result.driverEarnings,
    completedAt: serverTimestamp(),
  });
}

// The guide: a trip can be cancelled by either party before "in_progress"
export function cancelTripByDriver(tripId) {
  return transitionTrip(tripId, [TRIP_STATUS.accepted, TRIP_STATUS.driverArriving], {
    status: TRIP_STATUS.cancelled,
    cancelledBy: 'driver',
    cancelledAt: serverTimestamp(),
  });
}

export function getTripErrorMessage(error) {
  switch (error?.message) {
    case 'trip-not-available':
    case 'trip-not-found':
      return 'La solicitud ya no está disponible (fue aceptada, rechazada o cancelada).';
    case 'trip-not-yours':
      return 'Esta solicitud no está asignada a ti.';
    case 'trip-invalid-state':
      return 'El viaje cambió de estado mientras tanto. La pantalla ya muestra el estado actual.';
    case 'timeout':
      return 'El servidor no respondió. Revisa tu conexión e inténtalo de nuevo.';
    default:
      return 'No se pudo procesar la solicitud. Inténtalo de nuevo.';
  }
}