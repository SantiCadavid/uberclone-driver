// AI-assisted: see docs/AI_LOG.md #21
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, getLocale, isSupportedLanguage, translate } from '../i18n';
import { loadLanguagePreference, saveLanguagePreference } from '../services/preferencesService';
import { updateDriverProfile } from '../services/driverService';

const LanguageContext = createContext(null);

// uid + profileLanguage come from the session; they are empty before login
export function LanguageProvider({ uid, profileLanguage, children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  // undefined = still reading AsyncStorage; null = no explicit choice on this phone
  const [storedLanguage, setStoredLanguage] = useState(undefined);

  // 1. Read the phone preference once (works before login, so the Login screen uses it)
  useEffect(() => {
    let cancelled = false;
    loadLanguagePreference().then((saved) => {
      if (cancelled) return;
      const valid = isSupportedLanguage(saved) ? saved : null;
      setStoredLanguage(valid);
      if (valid) setLanguageState(valid);
    });
    // Cleanup: ignore the answer if the provider unmounts before AsyncStorage replies
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. No explicit choice on this phone: use the language saved in the driver's profile
  useEffect(() => {
    if (storedLanguage === null && isSupportedLanguage(profileLanguage)) {
      setLanguageState(profileLanguage);
    }
  }, [storedLanguage, profileLanguage]);

  // 3. Decision A: the last explicit choice wins and is copied to the profile.
  //    If it fails (offline), it is retried the next time the profile or the choice changes.
  useEffect(() => {
    if (!uid || !storedLanguage || !profileLanguage) return;
    if (profileLanguage !== storedLanguage) {
      updateDriverProfile(uid, { language: storedLanguage }).catch(() => {});
    }
  }, [uid, storedLanguage, profileLanguage]);

  const setLanguage = useCallback((nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) return;
    setLanguageState(nextLanguage);
    setStoredLanguage(nextLanguage);
    saveLanguagePreference(nextLanguage);
  }, []);

  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const value = useMemo(
    () => ({ language, locale: getLocale(language), setLanguage, t }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}