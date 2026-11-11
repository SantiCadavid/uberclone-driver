// AI-assisted: see docs/AI_LOG.md #13
export const LOCATION_CONFIG = {
  watchIntervalMs: 5000, // how often the phone reports a new position
  watchDistanceMeters: 10, // or after moving this many meters
  firestoreWriteIntervalMs: 5000, // never write to Firestore more often than this
  availabilityTimeoutMs: 8000, // give up on a write that gets no answer (no internet)
  // Medellín, used until the real position is known
  defaultRegion: {
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
};