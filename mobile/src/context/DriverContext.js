// AI-assisted: see docs/AI_LOG.md #13
import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useDriverProfile } from '../hooks/useDriverProfile';

const DriverContext = createContext(null);

// One Firestore subscription to the driver's profile, shared by every screen
export function DriverProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const { driver, loading, error } = useDriverProfile(uid);

  const value = useMemo(() => ({ uid, driver, loading, error }), [uid, driver, loading, error]);

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used inside DriverProvider');
  }
  return context;
}