// AI-assisted: see docs/AI_LOG.md #16, #18
import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeToActiveTrip } from '../services/tripService';
import { TRIP_STATUS } from '../config/trip';

// Custom hook: the driver's current trip in real time (null when there is none),
// plus the id of a trip that was just paid, kept until the driver closes its summary
export function useActiveTrip(driverId) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [summaryTripId, setSummaryTripId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastTripRef = useRef(null);

  useEffect(() => {
    lastTripRef.current = null;
    setSummaryTripId(null);
    if (!driverId) {
      setActiveTrip(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const unsubscribe = subscribeToActiveTrip(
      driverId,
      (trip) => {
        const previous = lastTripRef.current;
        // A completed trip that leaves the active list was just paid: keep it for the summary.
        // Set in the same callback as activeTrip so the navigator never jumps to Home in between.
        if (!trip && previous?.status === TRIP_STATUS.completed) {
          setSummaryTripId(previous.id);
        }
        lastTripRef.current = trip;
        setActiveTrip(trip);
        setError(null);
        setLoading(false);
      },
      () => {
          setError('trip.error.loadActive');
        setLoading(false);
      },
    );
    // Cleanup: close the listener on logout or when the driver changes
    return unsubscribe;
  }, [driverId]);

  const dismissSummary = useCallback(() => setSummaryTripId(null), []);

  return { activeTrip, summaryTripId, dismissSummary, loading, error };
}