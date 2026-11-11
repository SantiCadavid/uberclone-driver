// AI-assisted: see docs/AI_LOG.md #13, #16
import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useDriverProfile } from '../hooks/useDriverProfile';
import { useActiveTrip } from '../hooks/useActiveTrip';

const DriverContext = createContext(null);

// Driver session + active trip, shared by every screen with one subscription each
export function DriverProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const { driver, loading, error } = useDriverProfile(uid);
  const { activeTrip, error: activeTripError } = useActiveTrip(uid);

  const value = useMemo(
    () => ({ uid, driver, loading, error, activeTrip, activeTripError }),
    [uid, driver, loading, error, activeTrip, activeTripError],
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