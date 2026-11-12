// AI-assisted: see docs/AI_LOG.md #19
import { useEffect, useMemo, useState } from 'react';
import { getHistoryErrorMessage, subscribeToPaidTrips } from '../services/historyService';
import { filterTripsByRange, summarizeEarnings } from '../utils/earnings';
import { getPeriodRange } from '../utils/dates';
import { PERIODS } from '../config/history';

// Custom hook required by the guide: earnings of today, this week and this month
export function useEarnings(driverId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTrips([]);
    setError(null);
    if (!driverId) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const now = new Date();
    // Earliest start of the 3 periods (the week can begin in the previous month)
    const sinceMs = Math.min(
      getPeriodRange(PERIODS.week, now).startMs,
      getPeriodRange(PERIODS.month, now).startMs,
    );
    const unsubscribe = subscribeToPaidTrips(
      driverId,
      sinceMs,
      (paidTrips) => {
        setTrips(paidTrips);
        setError(null);
        setLoading(false);
      },
      (subscriptionError) => {
        if (__DEV__) console.warn('Earnings error:', subscriptionError?.message);
        setError(getHistoryErrorMessage(subscriptionError));
        setLoading(false);
      },
    );
    // Cleanup: closes the listener on logout or when the driver changes
    return unsubscribe;
  }, [driverId]);

  // useMemo: the totals are recalculated only when the list of trips changes
  const summaries = useMemo(() => {
    const now = new Date();
    const summarize = (period) => summarizeEarnings(filterTripsByRange(trips, getPeriodRange(period, now)));
    return {
      [PERIODS.today]: summarize(PERIODS.today),
      [PERIODS.week]: summarize(PERIODS.week),
      [PERIODS.month]: summarize(PERIODS.month),
    };
  }, [trips]);

  return { summaries, loading, error };
}