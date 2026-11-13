// AI-assisted: see docs/AI_LOG.md #20, #22
// Pure validators for tab 3 (documents and payments). Each returns an error message or null.
import { REGISTRATION_RULES as RULES } from '../config/registration';
import { defaultT } from '../i18n';
import { startOfDay } from './dates';
import { validateEmail, validatePhoto, validateRequired } from './validators';

const DIGITS_REGEX = /^\d+$/;
const YEAR_REGEX = /^\d{4}$/;

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

export function validateLicenseNumber(value, t = defaultT) {
  const requiredError = validateRequired(value, t);
  if (requiredError) return requiredError;
  const number = value.trim();
  if (!DIGITS_REGEX.test(number)) return t('validation.digitsOnly');
  if (number.length < RULES.licenseNumberMinDigits || number.length > RULES.licenseNumberMaxDigits) {
    return t('validation.digitsRange', { min: RULES.licenseNumberMinDigits, max: RULES.licenseNumberMaxDigits });
  }
  return null;
}

// The guide: the expiry date must be later than today. "today" is a parameter so tests are stable.
export function validateExpiryDate(value, today = new Date(), t = defaultT) {
  if (!isValidDate(value)) return t('validation.expiryRequired');
  const todayStart = startOfDay(today);
  const expiry = startOfDay(value);
  if (expiry <= todayStart) return t('validation.expiryFuture');
  const limit = new Date(todayStart);
  limit.setFullYear(limit.getFullYear() + RULES.maxExpiryYearsAhead);
  if (expiry > limit) return t('validation.expiryMax', { years: RULES.maxExpiryYearsAhead });
  return null;
}

// "Si aplica según el año del vehículo": required from N years of age.
// An unknown year counts as required (the strictest option); tab 2 blocks the submit anyway.
export function isTechnicalInspectionRequired(vehicleYear, currentYear = new Date().getFullYear()) {
  const yearText = String(vehicleYear ?? '').trim();
  if (!YEAR_REGEX.test(yearText)) return true;
  return currentYear - Number(yearText) >= RULES.technicalInspectionAfterYears;
}

export function validateTerms(accepted, t = defaultT) {
  return accepted === true ? null : t('validation.terms');
}

export function validateDocumentsData(
  data,
  { vehicleYear, today = new Date(), currentYear = new Date().getFullYear(), t = defaultT } = {},
) {
  const inspectionRequired = isTechnicalInspectionRequired(vehicleYear, currentYear);
  return {
    licenseNumber: validateLicenseNumber(data.licenseNumber, t),
    licensePhoto: validatePhoto(data.licensePhoto, 'validation.licensePhoto', t),
    licenseExpiry: validateExpiryDate(data.licenseExpiry, today, t),
    soatPhoto: validatePhoto(data.soatPhoto, 'validation.soatPhoto', t),
    soatExpiry: validateExpiryDate(data.soatExpiry, today, t),
    techPhoto: inspectionRequired ? validatePhoto(data.techPhoto, 'validation.techPhoto', t) : null,
    techExpiry: inspectionRequired ? validateExpiryDate(data.techExpiry, today, t) : null,
    mercadoPagoEmail: validateEmail(data.mercadoPagoEmail, t),
    acceptedTerms: validateTerms(data.acceptedTerms, t),
  };
}