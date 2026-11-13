// AI-assisted: see docs/AI_LOG.md #15, #23
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acceptTrip,
  getTripErrorKey,
  rejectTrip,
  subscribeToTripRequests,
} from '../services/tripService';
import { withTimeout } from '../utils/withTimeout';
import { TRIP_CONFIG } from '../config/trip';

// Custom hook: listens to incoming requests, runs the 15 s countdown and accepts/rejects.
// Notices and errors are translation keys: the screen shows them in the current language.
export function useTripRequests({ driverId, enabled }) {
  const [requests, setRequests] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(TRIP_CONFIG.requestTimeoutSeconds);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState(null); // { type, key }
  const [error, setError] = useState(null); // key

  const handledIdsRef = useRef(new Set()); // requests this driver already answered
  const processingRef = useRef(false); // blocks a second tap before React re-renders
  const previousIdRef = useRef(null);
  const expireRef = useRef(() => {});

  // Effect 1: real-time subscription, only while available
  useEffect(() => {
    if (!enabled || !driverId) {
      setRequests([]);
      return undefined;
    }
    const unsubscribe = subscribeToTripRequests(
      driverId,
      (items) => {
        setRequests(items);
        setError(null);
      },
      () => setError('request.error.load'),
    );
    // Cleanup: stop listening when the driver goes offline, leaves or logs out
    return unsubscribe;
  }, [enabled, driverId]);

  // The oldest request this driver has not answered yet
  const request = requests.find((item) => !handledIdsRef.current.has(item.id)) ?? null;
  const requestId = request?.id ?? null;

  const respond = useCallback(
    async (action, reason) => {
      if (!request || processingRef.current) return false;
      processingRef.current = true;
      handledIdsRef.current.add(request.id);
      setProcessing(true);
      setNotice(null);
      try {
        if (action === 'accept') {
          await withTimeout(acceptTrip(request.id, driverId), TRIP_CONFIG.actionTimeoutMs);
          setNotice({ type: 'ok', key: 'request.notice.accepted' });
        } else {
          await withTimeout(rejectTrip(request.id, reason), TRIP_CONFIG.actionTimeoutMs);
          setNotice({
            type: 'info',
            key: reason === 'expired' ? 'request.notice.expired' : 'request.notice.rejected',
          });
        }
        return true;
      } catch (actionError) {
        // If the request is still valid (e.g. no internet), show it again
        if (actionError?.message !== 'trip-not-available') {
          handledIdsRef.current.delete(request.id);
        }
        setNotice({ type: 'error', key: getTripErrorKey(actionError) });
        return false;
      } finally {
        processingRef.current = false;
        setProcessing(false);
      }
    },
    [request, driverId],
  );

  const accept = useCallback(() => respond('accept'), [respond]);
  const reject = useCallback(() => respond('reject', 'rejected'), [respond]);

  // Keeps the timer pointing to the latest respond function
  useEffect(() => {
    expireRef.current = () => respond('reject', 'expired');
  });

  // Effect 2: 15 s countdown measured from the request's creation time
  useEffect(() => {
    if (!request) return undefined;
    const startedAt = request.createdAt?.toMillis?.() ?? Date.now();
    const deadline = startedAt + TRIP_CONFIG.requestTimeoutSeconds * 1000;
    let intervalId = null;

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(intervalId);
        expireRef.current();
      }
    };

    intervalId = setInterval(tick, 500);
    tick();

    // Cleanup: stop the timer when the request is answered, replaced or the screen closes
    return () => clearInterval(intervalId);
  }, [requestId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 3: a request that disappears without our answer was cancelled by the passenger
  useEffect(() => {
    const previousId = previousIdRef.current;
    if (enabled && previousId && previousId !== requestId && !handledIdsRef.current.has(previousId)) {
      setNotice({ type: 'info', key: 'request.notice.cancelled' });
    }
    previousIdRef.current = requestId;
  }, [requestId, enabled]);

  return { request, secondsLeft, processing, notice, error, accept, reject };
}