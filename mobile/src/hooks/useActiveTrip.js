// AI-assisted: see docs/AI_LOG.md #16
import { useEffect, useState } from 'react';
import { subscribeToActiveTrip } from '../services/tripService';

// Custom hook: the driver's current trip in real time (null when there is none)
export function useActiveTrip(driverId) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) {
      setActiveTrip(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const unsubscribe = subscribeToActiveTrip(
      driverId,
      (trip) => {
        setActiveTrip(trip);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('No se pudo cargar el viaje activo. Revisa tu conexión.');
        setLoading(false);
      },
    );
    // Cleanup: close the listener on logout or when the driver changes
    return unsubscribe;
  }, [driverId]);

  return { activeTrip, loading, error };
}