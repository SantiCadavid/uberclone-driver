// AI-assisted: see docs/AI_LOG.md #11, #23
import { useEffect, useState } from 'react';
import { subscribeToDriver } from '../services/driverService';

// Custom hook: keeps the driver's profile in sync with Firestore in real time.
// "error" is a translation key.
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
        setError('driver.error.loadProfile');
        setLoading(false);
      },
    );

    // Cleanup: close the Firestore listener on logout, unmount or when the uid changes
    return unsubscribe;
  }, [uid]);

  return { driver, loading, error };
}