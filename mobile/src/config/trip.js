// AI-assisted: see docs/AI_LOG.md #14, #16
// Trip states saved in the "status" field (section 3 of the guide)
export const TRIP_STATUS = {
  requested: 'requested',
  accepted: 'accepted',
  rejected: 'rejected',
  driverArriving: 'driver_arriving',
  inProgress: 'in_progress',
  completed: 'completed',
  paid: 'paid',
  cancelled: 'cancelled',
};

// A trip in any of these states keeps the driver on the trip screen.
// "completed" stays active until the payment is confirmed (status "paid").
export const ACTIVE_TRIP_STATUSES = [
  TRIP_STATUS.accepted,
  TRIP_STATUS.driverArriving,
  TRIP_STATUS.inProgress,
  TRIP_STATUS.completed,
];

export const PAYMENT_METHODS = {
  mercadopago: 'mercadopago',
  cash: 'cash',
};

export const TRIP_CONFIG = {
  requestTimeoutSeconds: 15, // the driver has 15 s to accept or reject
  routingTimeoutMs: 10000,
  actionTimeoutMs: 8000, // give up on a trip update that gets no answer (no internet)
  geocodingDelayMs: 1100, // Nominatim allows at most 1 request per second
  // Simulated passenger: pickup near the driver, destination a few km away
  simulatedPickupKm: { min: 0.4, max: 1.2 },
  simulatedTripKm: { min: 2, max: 7 },
};

export const SIMULATED_PASSENGERS = [
  'Laura Gómez',
  'Andrés Restrepo',
  'Valentina Ríos',
  'Camilo Herrera',
  'Mariana López',
];