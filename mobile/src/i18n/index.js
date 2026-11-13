// AI-assisted: see docs/AI_LOG.md #21, #22
import es from './es';
import en from './en';
import esRegistration from './es.registration';
import enRegistration from './en.registration';

export const SUPPORTED_LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';

// One dictionary per language, merged from one file per area (a test checks both have the same keys)
export const TRANSLATIONS = {
  es: { ...es, ...esRegistration },
  en: { ...en, ...enRegistration },
};

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

// Dropdown options store a value + labelKey; this returns them with the label in the app language
export function translateOptions(options, t) {
  return options.map((option) => ({
    value: option.value,
    label: option.labelKey ? t(option.labelKey) : option.label,
  }));
}

// Label of one stored value (e.g. 'white' -> 'Blanco' / 'White'); '—' when unknown
export function optionLabel(options, value, t) {
  const option = options.find((item) => item.value === value);
  if (!option) return '—';
  return option.labelKey ? t(option.labelKey) : option.label;
}