// AI-assisted: see docs/AI_LOG.md #13, #23
import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { updateDriverLocation } from '../services/driverService';
import { LOCATION_CONFIG } from '../config/location';

const toCoords = (position) => ({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
});

// Custom hook: asks for permission, centers the map and, while "tracking" is true,
// watches the position and sends it to Firestore every few seconds.
// "error" is a translation key; the screen shows it in the current language.
export function useDriverLocation({ uid, tracking }) {
  const [location, setLocation] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);
  const lastWriteRef = useRef(0);

  // Effect 1: permission + current position once, to center the map
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (!granted) {
          setPermissionDenied(true);
          return;
        }
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) setLocation(toCoords(current));
      } catch (locationError) {
        if (!cancelled) setError('location.error.position');
      }
    })();

    // Cleanup: ignore late results if the screen was closed meanwhile
    return () => {
      cancelled = true;
    };
  }, []);

  // Effect 2: continuous tracking only while the driver is available
  useEffect(() => {
    if (!tracking || !uid || permissionDenied) return undefined;

    let subscription = null;
    let cancelled = false;
    setError(null);

    (async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: LOCATION_CONFIG.watchIntervalMs,
            distanceInterval: LOCATION_CONFIG.watchDistanceMeters,
          },
          (position) => {
            const coords = toCoords(position);
            setLocation(coords);

            // Throttle: at most one Firestore write every few seconds
            const now = Date.now();
            if (now - lastWriteRef.current >= LOCATION_CONFIG.firestoreWriteIntervalMs) {
              lastWriteRef.current = now;
              updateDriverLocation(uid, coords).catch(() => setError('location.error.send'));
            }
          },
        );
        // The cleanup may have run while we were waiting for the watcher: stop it right away
        if (cancelled) subscription.remove();
      } catch (watchError) {
        if (!cancelled) setError('location.error.watch');
      }
    })();

    // Cleanup: stop GPS tracking when the driver goes offline, leaves the screen or logs out
    return () => {
      cancelled = true;
      subscription?.remove();
      lastWriteRef.current = 0;
    };
  }, [tracking, uid, permissionDenied]);

  return { location, permissionDenied, error };
}