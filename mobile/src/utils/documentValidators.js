// AI-assisted: see docs/AI_LOG.md #20
// Pure validators for tab 3 (documents and payments). Each returns an error message or null.
import { REGISTRATION_RULES as RULES } from '../config/registration';
import { startOfDay } from './dates';
import { validateEmail, validatePhoto, validateRequired } from './validators';

const DIGITS_REGEX = /^\d+$/;
const YEAR_REGEX = /^\d{4}$/;

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

export function validateLicenseNumber(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  const number = value.trim();
  if (!DIGITS_REGEX.test(number)) return 'Solo se permiten números.';
  if (number.length < RULES.licenseNumberMinDigits || number.length > RULES.licenseNumberMaxDigits) {
    return `Debe tener entre ${RULES.licenseNumberMinDigits} y ${RULES.licenseNumberMaxDigits} dígitos.`;
  }
  return null;
}

// The guide: the expiry date must be later than today. "today" is a parameter so tests are stable.
export function validateExpiryDate(value, today = new Date()) {
  if (!isValidDate(value)) return 'Selecciona la fecha de vencimiento.';
  const todayStart = startOfDay(today);
  const expiry = startOfDay(value);
  if (expiry <= todayStart) return 'La fecha de vencimiento debe ser posterior a hoy.';
  const limit = new Date(todayStart);
  limit.setFullYear(limit.getFullYear() + RULES.maxExpiryYearsAhead);
  if (expiry > limit) return `Revisa la fecha: no puede superar ${RULES.maxExpiryYearsAhead} años.`;
  return null;
}

// "Si aplica según el año del vehículo": required from N years of age.
// An unknown year counts as required (the strictest option); tab 2 blocks the submit anyway.
export function isTechnicalInspectionRequired(vehicleYear, currentYear = new Date().getFullYear()) {
  const yearText = String(vehicleYear ?? '').trim();
  if (!YEAR_REGEX.test(yearText)) return true;
  return currentYear - Number(yearText) >= RULES.technicalInspectionAfterYears;
}

export function validateTerms(accepted) {
  return accepted === true ? null : 'Debes aceptar los términos y la comisión de la plataforma.';
}

export function validateDocumentsData(
  data,
  { vehicleYear, today = new Date(), currentYear = new Date().getFullYear() } = {},
) {
  const inspectionRequired = isTechnicalInspectionRequired(vehicleYear, currentYear);
  return {
    licenseNumber: validateLicenseNumber(data.licenseNumber),
    licensePhoto: validatePhoto(data.licensePhoto, 'La foto de la licencia es obligatoria.'),
    licenseExpiry: validateExpiryDate(data.licenseExpiry, today),
    soatPhoto: validatePhoto(data.soatPhoto, 'La foto del SOAT es obligatoria.'),
    soatExpiry: validateExpiryDate(data.soatExpiry, today),
    techPhoto: inspectionRequired
      ? validatePhoto(data.techPhoto, 'La foto de la revisión técnico-mecánica es obligatoria.')
      : null,
    techExpiry: inspectionRequired ? validateExpiryDate(data.techExpiry, today) : null,
    mercadoPagoEmail: validateEmail(data.mercadoPagoEmail),
    acceptedTerms: validateTerms(data.acceptedTerms),
  };
}