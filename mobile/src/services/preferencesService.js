// AI-assisted: see docs/AI_LOG.md #21
import AsyncStorage from '@react-native-async-storage/async-storage';

// The guide: AsyncStorage ONLY for preferences and the session. Never personal or payment data.
const KEYS = {
  language: '@uberclone/language',
  lastAvailability: '@uberclone/lastAvailability',
};

// Storage errors are swallowed: a failing preference must never break the app
export async function loadLanguagePreference() {
  try {
    return await AsyncStorage.getItem(KEYS.language);
  } catch (storageError) {
    return null;
  }
}

export async function saveLanguagePreference(language) {
  try {
    await AsyncStorage.setItem(KEYS.language, language);
  } catch (storageError) {
    // keep working with the language in memory
  }
}

export async function loadLastAvailability() {
  try {
    return (await AsyncStorage.getItem(KEYS.lastAvailability)) === 'true';
  } catch (storageError) {
    return false;
  }
}

export async function saveLastAvailability(isAvailable) {
  try {
    await AsyncStorage.setItem(KEYS.lastAvailability, String(Boolean(isAvailable)));
  } catch (storageError) {
    // not critical
  }
}