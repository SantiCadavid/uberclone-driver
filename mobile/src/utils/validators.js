// AI-assisted: see docs/AI_LOG.md #6, #7, #12
// Pure functions: each returns an error message (string) or null when the value is valid
import {
  CAPACITY_BY_CATEGORY,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  MAX_VEHICLE_CAPACITY,
  REGISTRATION_RULES as RULES,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from '../config/registration';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;
const DIGITS_REGEX = /^\d+$/;
const YEAR_REGEX = /^\d{4}$/;
const PLATE_REGEX = /^[A-Z]{3}\d{3}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const REQUIRED_MESSAGE = 'Este campo es obligatorio.';

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const categoryLabel = (value) =>
  VEHICLE_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;

// ---------- Generic ----------

export function validateRequired(value, message = REQUIRED_MESSAGE) {
  if (value === null || value === undefined) return message;
  if (typeof value === 'string' && value.trim() === '') return message;
  return null;
}

export function validateEmail(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!EMAIL_REGEX.test(value.trim())) {
    return 'Ingresa un correo válido (ej. nombre@dominio.com).';
  }
  return null;
}

export function validateOption(value, options, message = 'Selecciona una opción.') {
  return options.some((option) => option.value === value) ? null : message;
}

export function validatePhoto(uri, message) {
  return uri ? null : message;
}

export function validateMaxLengthText(value, maxLength) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (value.trim().length > maxLength) return `Máximo ${maxLength} caracteres.`;
  return null;
}

// ---------- Tab 1: personal data ----------

export function validateFullName(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  const name = value.trim();
  if (name.length > RULES.maxFullNameLength) {
    return `Máximo ${RULES.maxFullNameLength} caracteres.`;
  }
  if (!NAME_REGEX.test(name)) return 'Solo se permiten letras y espacios.';
  // Words of 2+ letters; short connectors like "de" or "la" also count
  const words = name.split(/\s+/).filter((word) => word.length >= 2);
  if (words.length < RULES.minFullNameWords) {
    return 'Escribe al menos un nombre y un apellido.';
  }
  return null;
}

export function validateDocumentId(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  const documentId = value.trim();
  if (!DIGITS_REGEX.test(documentId)) return 'Solo se permiten números.';
  if (documentId.startsWith('0')) return 'No puede empezar por 0.';
  if (
    documentId.length < RULES.documentIdMinDigits ||
    documentId.length > RULES.documentIdMaxDigits
  ) {
    return `Debe tener entre ${RULES.documentIdMinDigits} y ${RULES.documentIdMaxDigits} dígitos.`;
  }
  return null;
}

export function validatePhone(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  const phone = value.trim();
  if (!DIGITS_REGEX.test(phone)) return 'Solo se permiten números.';
  if (phone.length !== RULES.phoneDigits) {
    return `Debe tener exactamente ${RULES.phoneDigits} dígitos.`;
  }
  if (!phone.startsWith(RULES.phonePrefix)) {
    return `El celular debe empezar por ${RULES.phonePrefix}.`;
  }
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

export function validateBirthDate(value, today = new Date()) {
  if (!isValidDate(value)) return 'Selecciona tu fecha de nacimiento.';
  if (value > today) return 'La fecha no puede ser futura.';
  const age = calculateAge(value, today);
  if (age < RULES.minDriverAge) return `Debes ser mayor de ${RULES.minDriverAge} años.`;
  if (age > RULES.maxDriverAge) {
    return `Revisa la fecha: la edad máxima es ${RULES.maxDriverAge} años.`;
  }
  return null;
}

// Passwords are not trimmed: spaces are valid characters
export function validatePassword(value) {
  if (!value) return REQUIRED_MESSAGE;
  if (value.length < RULES.minPasswordLength) {
    return `Mínimo ${RULES.minPasswordLength} caracteres.`;
  }
  if (!PASSWORD_REGEX.test(value)) return 'Debe incluir al menos una letra y un número.';
  return null;
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return 'Confirma tu contraseña.';
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}

// ---------- Tab 2: vehicle ----------

// The guide asks to convert to uppercase before validating; spaces and dashes are also removed
export function normalizePlate(value) {
  return (value ?? '').replace(/[\s-]/g, '').toUpperCase();
}

export function validatePlate(value) {
  const plate = normalizePlate(value);
  if (!plate) return REQUIRED_MESSAGE;
  if (!PLATE_REGEX.test(plate)) {
    return 'Formato inválido. Usa 3 letras y 3 números (ej. ABC123).';
  }
  return null;
}

export function validateYear(value, currentYear = new Date().getFullYear()) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  const year = String(value).trim();
  if (!YEAR_REGEX.test(year)) return 'Debe tener 4 dígitos (ej. 2020).';
  const maxYear = currentYear + RULES.maxModelYearsAhead;
  if (Number(year) > maxYear) return `No puede ser mayor a ${maxYear}.`;
  return null;
}

export function validateCapacity(value, category) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  const capacityText = String(value).trim();
  if (!DIGITS_REGEX.test(capacityText)) return 'Solo se permiten números enteros.';
  const capacity = Number(capacityText);
  if (capacity < 1) return 'Debe ser al menos 1.';

  const range = CAPACITY_BY_CATEGORY[category];
  if (!range) {
    // No category selected yet: only the general maximum applies
    return capacity > MAX_VEHICLE_CAPACITY ? `Máximo ${MAX_VEHICLE_CAPACITY} pasajeros.` : null;
  }
  const label = categoryLabel(category);
  if (capacity < range.min) return `La categoría ${label} exige mínimo ${range.min} pasajeros.`;
  if (capacity > range.max) return `La categoría ${label} permite máximo ${range.max} pasajeros.`;
  return null;
}

// ---------- Whole tabs ----------

export function validatePersonalData(data, today = new Date()) {
  return {
    profilePhoto: validatePhoto(data.profilePhoto, 'La foto de perfil es obligatoria.'),
    fullName: validateFullName(data.fullName),
    documentId: validateDocumentId(data.documentId),
    phone: validatePhone(data.phone),
    birthDate: validateBirthDate(data.birthDate, today),
    gender: validateOption(data.gender, GENDER_OPTIONS, 'Selecciona un género.'),
    email: validateEmail(data.email),
    language: validateOption(data.language, LANGUAGE_OPTIONS, 'Selecciona un idioma.'),
    password: validatePassword(data.password),
    confirmPassword: validatePasswordConfirmation(data.password, data.confirmPassword),
  };
}

export function validateVehicleData(data, currentYear = new Date().getFullYear()) {
  return {
    category: validateOption(data.category, VEHICLE_CATEGORY_OPTIONS, 'Selecciona una categoría.'),
    plate: validatePlate(data.plate),
    brand: validateMaxLengthText(data.brand, RULES.maxBrandLength),
    model: validateMaxLengthText(data.model, RULES.maxModelLength),
    year: validateYear(data.year, currentYear),
    color: validateOption(data.color, VEHICLE_COLOR_OPTIONS, 'Selecciona un color.'),
    capacity: validateCapacity(data.capacity, data.category),
    vehiclePhoto: validatePhoto(
      data.vehiclePhoto,
      'La foto del vehículo es obligatoria (debe verse la placa).',
    ),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}