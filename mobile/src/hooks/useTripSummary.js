// AI-assisted: see docs/AI_LOG.md #18, #23
import { useEffect, useState } from 'react';
import { subscribeToTrip } from '../services/tripService';

// Custom hook: keeps a just-paid trip in real time so the driver can see its final summary
export function useTripSummary(tripId) {
  const [summaryTrip, setSummaryTrip] = useState(null);
  const [error, setError] = useState(null); // translation key

  useEffect(() => {
    setSummaryTrip(null);
    setError(null);
    if (!tripId) return undefined;

    const unsubscribe = subscribeToTrip(
      tripId,
      (trip) => {
        setSummaryTrip(trip);
        setError(trip ? null : 'trip.summary.notFound');
      },
      () => setError('trip.summary.loadError'),
    );
    // Cleanup: closes the listener when the driver taps "Continuar", changes trip or logs out
    return unsubscribe;
  }, [tripId]);

  return { summaryTrip, error };
}