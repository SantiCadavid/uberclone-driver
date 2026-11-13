// AI-assisted: see docs/AI_LOG.md #21
import es from './es';
import en from './en';

export const SUPPORTED_LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';
export const TRANSLATIONS = { es, en };

// Locale used by date pickers and date formatting
const LOCALES = { es: 'es-CO', en: 'en-US' };

export const isSupportedLanguage = (language) => SUPPORTED_LANGUAGES.includes(language);

export function getLocale(language) {
  return LOCALES[language] ?? LOCALES[DEFAULT_LANGUAGE];
}

// Pure function: text for a key with {param} placeholders replaced.
// Unknown language -> Spanish; unknown key -> the key itself (never a blank text).
export function translate(language, key, params = {}) {
  const table = TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE];
  const text = table[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (params[name] !== undefined ? String(params[name]) : match));
}

// Spanish translator used as default parameter by pure functions (keeps their tests unchanged)
export const defaultT = (key, params) => translate(DEFAULT_LANGUAGE, key, params);