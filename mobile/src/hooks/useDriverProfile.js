// AI-assisted: see docs/AI_LOG.md #11
import { useEffect, useState } from 'react';
import { subscribeToDriver } from '../services/driverService';

// Custom hook: keeps the driver's profile in sync with Firestore in real time
export function useDriverProfile(uid) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setDriver(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeToDriver(
      uid,
      (data) => {
        setDriver(data);
        setError(null);
        setLoading(false);
      },
      () => {
        setError('No se pudo cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.');
        setLoading(false);
      },
    );

    // Cleanup: close the Firestore listener on logout, unmount or when the uid changes
    return unsubscribe;
  }, [uid]);

  return { driver, loading, error };
}