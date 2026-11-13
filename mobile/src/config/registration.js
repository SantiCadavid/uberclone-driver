// AI-assisted: see docs/AI_LOG.md #7, #12, #20, #22
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
  // Documents (tab 3)
  licenseNumberMinDigits: 6,
  licenseNumberMaxDigits: 15,
  maxExpiryYearsAhead: 10, // catches typos such as the year 2099
  // Technical-mechanical inspection is required from this vehicle age (didactic rule, confirm with the teacher)
  technicalInspectionAfterYears: 6,
};

// Passenger capacity allowed per vehicle category
export const CAPACITY_BY_CATEGORY = {
  economy: { min: 1, max: 4 },
  premium: { min: 1, max: 4 },
  xl: { min: 6, max: 8 },
};

// Used when no category has been selected yet
export const MAX_VEHICLE_CAPACITY = 8;

// "label" stays in Spanish for older code; screens show t(labelKey) through translateOptions
export const GENDER_OPTIONS = [
  { value: 'female', label: 'Femenino', labelKey: 'option.gender.female' },
  { value: 'male', label: 'Masculino', labelKey: 'option.gender.male' },
  { value: 'other', label: 'Otro', labelKey: 'option.gender.other' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decirlo', labelKey: 'option.gender.prefer_not_to_say' },
];

// Each language is shown in its own name, so anyone can recognize it
export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];

// Same categories the passenger chooses (economy, xl, premium)
export const VEHICLE_CATEGORY_OPTIONS = [
  { value: 'economy', label: 'Económico', labelKey: 'option.category.economy' },
  { value: 'xl', label: 'XL', labelKey: 'option.category.xl' },
  { value: 'premium', label: 'Premium', labelKey: 'option.category.premium' },
];

export const VEHICLE_COLOR_OPTIONS = [
  { value: 'white', label: 'Blanco', labelKey: 'option.color.white' },
  { value: 'black', label: 'Negro', labelKey: 'option.color.black' },
  { value: 'gray', label: 'Gris', labelKey: 'option.color.gray' },
  { value: 'silver', label: 'Plateado', labelKey: 'option.color.silver' },
  { value: 'red', label: 'Rojo', labelKey: 'option.color.red' },
  { value: 'blue', label: 'Azul', labelKey: 'option.color.blue' },
  { value: 'green', label: 'Verde', labelKey: 'option.color.green' },
  { value: 'yellow', label: 'Amarillo', labelKey: 'option.color.yellow' },
  { value: 'other', label: 'Otro', labelKey: 'option.color.other' },
];