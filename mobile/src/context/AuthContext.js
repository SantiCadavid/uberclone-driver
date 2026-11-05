// AI-assisted: see docs/AI_LOG.md #6, #10
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeToAuthChanges } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  // While true, the navigator keeps the register screen even if Firebase already signed in
  const [registrationInProgress, setRegistrationInProgress] = useState(false);

  useEffect(() => {
    // Firebase calls this once on start (restored session or null) and on every login/logout
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    // Cleanup: stop listening to Firebase when the provider unmounts
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, initializing, registrationInProgress, setRegistrationInProgress }),
    [user, initializing, registrationInProgress],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}