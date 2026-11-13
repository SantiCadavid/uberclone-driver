// AI-assisted: see docs/AI_LOG.md #6, #7, #12, #22
// Pure functions: each returns an error message (string) or null when the value is valid.
// "t" translates message keys; it defaults to Spanish so the tests and older callers keep working.
import {
  CAPACITY_BY_CATEGORY,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  MAX_VEHICLE_CAPACITY,
  REGISTRATION_RULES as RULES,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from '../config/registration';
import { defaultT } from '../i18n';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
const DIGITS_REGEX = /^\d+$/;
const YEAR_REGEX = /^\d{4}$/;
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const categoryLabel = (value, t) => {
  const option = VEHICLE_CATEGORY_OPTIONS.find((item) => item.value === value);
  return option ? t(option.labelKey) : value;
};

// ---------- Generic ----------

export function validateRequired(value, t = defaultT) {
  if (value === null || value === undefined) return t('validation.required');
  if (typeof value === 'string' && value.trim() === '') return t('validation.required');
  return null;
}

export function validateEmail(value, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  if (!EMAIL_REGEX.test(value.trim())) return t('validation.email');
  return null;
}

export function validateOption(value, options, messageKey = 'validation.option', t = defaultT) {
  return options.some((option) => option.value === value) ? null : t(messageKey);
}

export function validatePhoto(uri, messageKey, t = defaultT) {
  return uri ? null : t(messageKey);
}

export function validateMaxLengthText(value, maxLength, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  if (value.trim().length > maxLength) return t('validation.maxLength', { max: maxLength });
  return null;
}

// ---------- Tab 1: personal data ----------

export function validateFullName(value, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  const name = value.trim();
  if (name.length > RULES.maxFullNameLength) {
    return t('validation.maxLength', { max: RULES.maxFullNameLength });
  }
  if (!NAME_REGEX.test(name)) return t('validation.lettersOnly');
  // Words of 2+ letters; short connectors like "de" or "la" also count
  const words = name.split(/\s+/).filter((word) => word.length >= 2);
  if (words.length < RULES.minFullNameWords) return t('validation.fullNameWords');
  return null;
}

export function validateDocumentId(value, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  const documentId = value.trim();
  if (!DIGITS_REGEX.test(documentId)) return t('validation.digitsOnly');
  if (documentId.startsWith('0')) return t('validation.noLeadingZero');
  if (
    documentId.length < RULES.documentIdMinDigits ||
    documentId.length > RULES.documentIdMaxDigits
  ) {
    return t('validation.digitsRange', { min: RULES.documentIdMinDigits, max: RULES.documentIdMaxDigits });
  }
  return null;
}

export function validatePhone(value, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  const phone = value.trim();
  if (!DIGITS_REGEX.test(phone)) return t('validation.digitsOnly');
  if (phone.length !== RULES.phoneDigits) return t('validation.digitsExact', { count: RULES.phoneDigits });
  if (!phone.startsWith(RULES.phonePrefix)) return t('validation.phonePrefix', { prefix: RULES.phonePrefix });
  return null;
}

// "today" is a parameter so tests give the same result any day
export function calculateAge(birthDate, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const birthdayNotReached =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate());
  if (birthdayNotReached) age -= 1;
  return age;
}

export function validateBirthDate(value, today = new Date(), t = defaultT) {
  if (!isValidDate(value)) return t('validation.birthDateRequired');
  if (value > today) return t('validation.futureDate');
  const age = calculateAge(value, today);
  if (age < RULES.minDriverAge) return t('validation.minAge', { min: RULES.minDriverAge });
  if (age > RULES.maxDriverAge) return t('validation.maxAge', { max: RULES.maxDriverAge });
  return null;
}

// Passwords are not trimmed: spaces are valid characters
export function validatePassword(value, t = defaultT) {
  if (!value) return t('validation.required');
  if (value.length < RULES.minPasswordLength) return t('validation.minLength', { min: RULES.minPasswordLength });
  if (!PASSWORD_REGEX.test(value)) return t('validation.passwordMix');
  return null;
}

export function validatePasswordConfirmation(password, confirmation, t = defaultT) {
  if (!confirmation) return t('validation.confirmPassword');
  if (password !== confirmation) return t('validation.passwordMismatch');
  return null;
}

// ---------- Tab 2: vehicle ----------

// The guide asks to convert to uppercase before validating; spaces and dashes are also removed
export function normalizePlate(value) {
  return (value ?? '').replace(/[\s-]/g, '').toUpperCase();
}

export function validatePlate(value, t = defaultT) {
  const plate = normalizePlate(value);
  if (!plate) return t('validation.required');
  if (!PLATE_REGEX.test(plate)) return t('validation.plateFormat');
  return null;
}

export function validateYear(value, currentYear = new Date().getFullYear(), t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  const year = String(value).trim();
  if (!YEAR_REGEX.test(year)) return t('validation.yearFormat');
  const maxYear = currentYear + RULES.maxModelYearsAhead;
  if (Number(year) > maxYear) return t('validation.yearMax', { max: maxYear });
  return null;
}

export function validateCapacity(value, category, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  const capacityText = String(value).trim();
  if (!DIGITS_REGEX.test(capacityText)) return t('validation.integerOnly');
  const capacity = Number(capacityText);
  if (capacity < 1) return t('validation.capacityMin');

  const range = CAPACITY_BY_CATEGORY[category];
  if (!range) {
    // No category selected yet: only the general maximum applies
    return capacity > MAX_VEHICLE_CAPACITY ? t('validation.capacityMax', { max: MAX_VEHICLE_CAPACITY }) : null;
  }
  const label = categoryLabel(category, t);
  if (capacity < range.min) return t('validation.capacityCategoryMin', { category: label, min: range.min });
  if (capacity > range.max) return t('validation.capacityCategoryMax', { category: label, max: range.max });
  return null;
}

// ---------- Whole tabs ----------

export function validatePersonalData(data, today = new Date(), t = defaultT) {
  return {
    profilePhoto: validatePhoto(data.profilePhoto, 'validation.profilePhoto', t),
    fullName: validateFullName(data.fullName, t),
    documentId: validateDocumentId(data.documentId, t),
    phone: validatePhone(data.phone, t),
    birthDate: validateBirthDate(data.birthDate, today, t),
    gender: validateOption(data.gender, GENDER_OPTIONS, 'validation.gender', t),
    email: validateEmail(data.email, t),
    language: validateOption(data.language, LANGUAGE_OPTIONS, 'validation.language', t),
    password: validatePassword(data.password, t),
    confirmPassword: validatePasswordConfirmation(data.password, data.confirmPassword, t),
  };
}

export function validateVehicleData(data, currentYear = new Date().getFullYear(), t = defaultT) {
  return {
    category: validateOption(data.category, VEHICLE_CATEGORY_OPTIONS, 'validation.category', t),
    plate: validatePlate(data.plate, t),
    brand: validateMaxLengthText(data.brand, RULES.maxBrandLength, t),
    model: validateMaxLengthText(data.model, RULES.maxModelLength, t),
    year: validateYear(data.year, currentYear, t),
    color: validateOption(data.color, VEHICLE_COLOR_OPTIONS, 'validation.color', t),
    capacity: validateCapacity(data.capacity, data.category, t),
    vehiclePhoto: validatePhoto(data.vehiclePhoto, 'validation.vehiclePhoto', t),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}