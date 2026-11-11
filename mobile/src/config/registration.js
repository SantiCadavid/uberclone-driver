// AI-assisted: see docs/AI_LOG.md #7, #12
// Single place for registration limits and dropdown options
export const REGISTRATION_RULES = {
  maxFullNameLength: 50,
  minFullNameWords: 2, // first name + last name
  documentIdMinDigits: 6,
  documentIdMaxDigits: 10,
  phoneDigits: 10,
  phonePrefix: '3', // Colombian mobile numbers start with 3
  minDriverAge: 18,
  maxDriverAge: 80,
  minPasswordLength: 8,
  maxBrandLength: 30,
  maxModelLength: 30,
  // Dealers sell next year's models in advance (e.g. 2027 models during 2026)
  maxModelYearsAhead: 1,
};

// Passenger capacity allowed per vehicle category
export const CAPACITY_BY_CATEGORY = {
  economy: { min: 1, max: 4 },
  premium: { min: 1, max: 4 },
  xl: { min: 6, max: 8 },
};

// Used when no category has been selected yet
export const MAX_VEHICLE_CAPACITY = 8;

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

// Same categories the passenger chooses (economy, xl, premium)
export const VEHICLE_CATEGORY_OPTIONS = [
  { value: 'economy', label: 'Económico' },
  { value: 'xl', label: 'XL' },
  { value: 'premium', label: 'Premium' },
];

export const VEHICLE_COLOR_OPTIONS = [
  { value: 'white', label: 'Blanco' },
  { value: 'black', label: 'Negro' },
  { value: 'gray', label: 'Gris' },
  { value: 'silver', label: 'Plateado' },
  { value: 'red', label: 'Rojo' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'other', label: 'Otro' },
];