// AI-assisted: see docs/AI_LOG.md #19
import { useCallback, useRef, useState } from 'react';
import { fetchTripHistoryPage, getHistoryErrorMessage } from '../services/historyService';
import { withTimeout } from '../utils/withTimeout';
import { HISTORY_CONFIG } from '../config/history';

// Custom hook: paginated history (20 per page) for the selected filters
export function useTripHistory({ driverId, range, paymentMethod }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const cursorRef = useRef(null);
  const requestIdRef = useRef(0); // ignores answers of an old filter
  const loadingMoreRef = useRef(false); // blocks repeated onEndReached calls
  const startMs = range?.startMs ?? null;
  const endMs = range?.endMs ?? null;

  const fetchPage = useCallback(
    (cursor) =>
      withTimeout(
        fetchTripHistoryPage({ driverId, range: { startMs, endMs }, paymentMethod, cursor }),
        HISTORY_CONFIG.requestTimeoutMs,
      ),
    [driverId, startMs, endMs, paymentMethod],
  );

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    cursorRef.current = null;
    setError(null);
    if (!driverId || startMs === null) {
      setTrips([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const page = await fetchPage(null);
      if (requestId !== requestIdRef.current) return;
      cursorRef.current = page.cursor;
      setTrips(page.trips);
      setHasMore(page.hasMore);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      if (__DEV__) console.warn('History error:', loadError?.message);
      setTrips([]);
      setHasMore(false);
      setError(getHistoryErrorMessage(loadError));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [driverId, startMs, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMore || !cursorRef.current) return;
    const requestId = requestIdRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await fetchPage(cursorRef.current);
      if (requestId !== requestIdRef.current) return;
      cursorRef.current = page.cursor;
      // Avoid duplicates if a trip changed between pages
      setTrips((previous) => {
        const known = new Set(previous.map((trip) => trip.id));
        return [...previous, ...page.trips.filter((trip) => !known.has(trip.id))];
      });
      setHasMore(page.hasMore);
    } catch (loadError) {
      if (requestId === requestIdRef.current) setError(getHistoryErrorMessage(loadError));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loading, hasMore, fetchPage]);

  return { trips, loading, loadingMore, hasMore, error, reload, loadMore };
}