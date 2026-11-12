// AI-assisted: see docs/AI_LOG.md #13, #16, #18
import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useDriverProfile } from '../hooks/useDriverProfile';
import { useActiveTrip } from '../hooks/useActiveTrip';
import { useTripSummary } from '../hooks/useTripSummary';

const DriverContext = createContext(null);

// Driver session + active trip + final summary, shared by every screen with one subscription each
export function DriverProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const { driver, loading, error } = useDriverProfile(uid);
  const { activeTrip, summaryTripId, dismissSummary, error: activeTripError } = useActiveTrip(uid);
  const { summaryTrip, error: summaryError } = useTripSummary(summaryTripId);

  const value = useMemo(
    () => ({
      uid,
      driver,
      loading,
      error,
      activeTrip,
      activeTripError,
      summaryTripId,
      summaryTrip,
      summaryError,
      dismissSummary,
    }),
    [uid, driver, loading, error, activeTrip, activeTripError, summaryTripId, summaryTrip, summaryError, dismissSummary],
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used inside DriverProvider');
  }
  return context;
}