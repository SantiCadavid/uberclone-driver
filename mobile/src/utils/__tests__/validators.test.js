// AI-assisted: see docs/AI_LOG.md #7, #12
import {
  calculateAge,
  hasErrors,
  normalizePlate,
  validateBirthDate,
  validateCapacity,
  validateDocumentId,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordConfirmation,
  validatePersonalData,
  validatePhone,
  validatePlate,
  validateVehicleData,
  validateYear,
} from '../validators';

// Fixed "today" so results do not depend on the day the tests run (months are 0-based)
const TODAY = new Date(2026, 10, 4); // 2026-11-04
const CURRENT_YEAR = 2026;

describe('Tab 1 - personal data', () => {
  test('full name: accepts letters, accents, spaces and connectors', () => {
    expect(validateFullName('Santiago Cadavid Muñoz')).toBeNull();
    expect(validateFullName('Ana de la Rosa')).toBeNull();
  });
  test('full name: rejects numbers and symbols', () => {
    expect(validateFullName('Santiago 2')).toBe('Solo se permiten letras y espacios.');
  });
  test('full name: rejects more than 50 characters', () => {
    expect(validateFullName('a'.repeat(51))).toBe('Máximo 50 caracteres.');
  });
  test('full name: rejects only spaces', () => {
    expect(validateFullName('   ')).toBe('Este campo es obligatorio.');
  });
  test('full name: requires first name and last name', () => {
    const message = 'Escribe al menos un nombre y un apellido.';
    expect(validateFullName('Santiago')).toBe(message);
    expect(validateFullName('Juan C')).toBe(message);
  });

  test('document: accepts 6 and 10 digits', () => {
    expect(validateDocumentId('123456')).toBeNull();
    expect(validateDocumentId('1234567890')).toBeNull();
  });
  test('document: rejects 5 and 11 digits', () => {
    expect(validateDocumentId('12345')).toBe('Debe tener entre 6 y 10 dígitos.');
    expect(validateDocumentId('12345678901')).toBe('Debe tener entre 6 y 10 dígitos.');
  });
  test('document: rejects letters', () => {
    expect(validateDocumentId('12a456')).toBe('Solo se permiten números.');
  });
  test('document: rejects a leading zero', () => {
    expect(validateDocumentId('0123456')).toBe('No puede empezar por 0.');
  });

  test('phone: accepts exactly 10 digits starting with 3', () => {
    expect(validatePhone('3001234567')).toBeNull();
  });
  test('phone: rejects 9 digits', () => {
    expect(validatePhone('300123456')).toBe('Debe tener exactamente 10 dígitos.');
  });
  test('phone: rejects numbers that do not start with 3', () => {
    expect(validatePhone('6041234567')).toBe('El celular debe empezar por 3.');
  });

  test('age: birthday not reached this year subtracts one', () => {
    expect(calculateAge(new Date(2000, 11, 25), TODAY)).toBe(25);
  });
  test('birth date: exactly 18 today is valid', () => {
    expect(validateBirthDate(new Date(2008, 10, 4), TODAY)).toBeNull();
  });
  test('birth date: one day short of 18 is invalid', () => {
    expect(validateBirthDate(new Date(2008, 10, 5), TODAY)).toBe('Debes ser mayor de 18 años.');
  });
  test('birth date: future and empty are invalid', () => {
    expect(validateBirthDate(new Date(2030, 0, 1), TODAY)).toBe('La fecha no puede ser futura.');
    expect(validateBirthDate(null, TODAY)).toBe('Selecciona tu fecha de nacimiento.');
  });
  test('birth date: 80 years is valid, 81 is not', () => {
    expect(validateBirthDate(new Date(1946, 10, 4), TODAY)).toBeNull();
    expect(validateBirthDate(new Date(1945, 10, 3), TODAY)).toBe(
      'Revisa la fecha: la edad máxima es 80 años.',
    );
  });

  test('email: accepts a valid email and rejects a missing domain', () => {
    expect(validateEmail('conductor@uberclone.com')).toBeNull();
    expect(validateEmail('hola@')).toBe('Ingresa un correo válido (ej. nombre@dominio.com).');
  });

  test('password: requires 8 characters with letters and numbers', () => {
    expect(validatePassword('clave2026')).toBeNull();
    expect(validatePassword('abc1')).toBe('Mínimo 8 caracteres.');
    expect(validatePassword('soloLetras')).toBe('Debe incluir al menos una letra y un número.');
  });
  test('password confirmation: must match', () => {
    expect(validatePasswordConfirmation('clave2026', 'clave2026')).toBeNull();
    expect(validatePasswordConfirmation('clave2026', 'clave2027')).toBe('Las contraseñas no coinciden.');
  });
});

describe('Tab 2 - vehicle', () => {
  test('plate: converts to uppercase before validating', () => {
    expect(normalizePlate('abc 123')).toBe('ABC123');
    expect(validatePlate('abc123')).toBeNull();
  });
  test('plate: rejects wrong formats', () => {
    const message = 'Formato inválido. Usa 3 letras y 3 números (ej. ABC123).';
    expect(validatePlate('ABC12')).toBe(message);
    expect(validatePlate('AB1234')).toBe(message);
  });

  test('year: accepts next year models and rejects two years ahead', () => {
    expect(validateYear('2026', CURRENT_YEAR)).toBeNull();
    expect(validateYear('2027', CURRENT_YEAR)).toBeNull();
    expect(validateYear('2028', CURRENT_YEAR)).toBe('No puede ser mayor a 2027.');
  });
  test('year: rejects non 4-digit values', () => {
    expect(validateYear('20a6', CURRENT_YEAR)).toBe('Debe tener 4 dígitos (ej. 2020).');
  });

  test('capacity: XL requires at least 6', () => {
    expect(validateCapacity('5', 'xl')).toBe('La categoría XL exige mínimo 6 pasajeros.');
    expect(validateCapacity('6', 'xl')).toBeNull();
  });
  test('capacity: economy accepts 4, rejects 0 and decimals', () => {
    expect(validateCapacity('4', 'economy')).toBeNull();
    expect(validateCapacity('0', 'economy')).toBe('Debe ser al menos 1.');
    expect(validateCapacity('2.5', 'economy')).toBe('Solo se permiten números enteros.');
  });
  test('capacity: maximum per category', () => {
    expect(validateCapacity('5', 'economy')).toBe(
      'La categoría Económico permite máximo 4 pasajeros.',
    );
    expect(validateCapacity('8', 'xl')).toBeNull();
    expect(validateCapacity('9', 'xl')).toBe('La categoría XL permite máximo 8 pasajeros.');
  });
});

describe('Whole tabs', () => {
  const validPersonalData = {
    profilePhoto: 'file:///photo.jpg',
    fullName: 'Santiago Cadavid',
    documentId: '1020304050',
    phone: '3001234567',
    birthDate: new Date(2000, 0, 15),
    gender: 'male',
    email: 'santiago@uberclone.com',
    language: 'es',
    password: 'clave2026',
    confirmPassword: 'clave2026',
  };

  const validVehicleData = {
    category: 'xl',
    plate: 'abc123',
    brand: 'Renault',
    model: 'Duster',
    year: '2022',
    color: 'white',
    capacity: '6',
    vehiclePhoto: 'file:///car.jpg',
  };

  test('valid personal data has no errors', () => {
    expect(hasErrors(validatePersonalData(validPersonalData, TODAY))).toBe(false);
  });
  test('empty personal data has an error in every field', () => {
    const errors = validatePersonalData({}, TODAY);
    expect(Object.values(errors).every(Boolean)).toBe(true);
  });
  test('valid vehicle data has no errors', () => {
    expect(hasErrors(validateVehicleData(validVehicleData, CURRENT_YEAR))).toBe(false);
  });
  test('empty vehicle data has an error in every field', () => {
    const errors = validateVehicleData({}, CURRENT_YEAR);
    expect(Object.values(errors).every(Boolean)).toBe(true);
  });
});