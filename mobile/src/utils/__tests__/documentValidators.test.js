// AI-assisted: see docs/AI_LOG.md #20
import {
  isTechnicalInspectionRequired,
  validateDocumentsData,
  validateExpiryDate,
  validateLicenseNumber,
  validateTerms,
} from '../documentValidators';
import { hasErrors } from '../validators';

// Fixed "today" so results do not depend on the day the tests run (months are 0-based)
const TODAY = new Date(2026, 10, 4); // 2026-11-04
const CURRENT_YEAR = 2026;

const VALID_DATA = {
  licenseNumber: '1234567890',
  licensePhoto: 'file://license.jpg',
  licenseExpiry: new Date(2030, 0, 15),
  soatPhoto: 'file://soat.jpg',
  soatExpiry: new Date(2027, 5, 1),
  techPhoto: null,
  techExpiry: null,
  mercadoPagoEmail: 'pagos@correo.com',
  acceptedTerms: true,
};

describe('validateLicenseNumber', () => {
  test('empty is required', () => {
    expect(validateLicenseNumber('')).toBe('Este campo es obligatorio.');
  });
  test('letters are rejected', () => {
    expect(validateLicenseNumber('12AB56')).toBe('Solo se permiten números.');
  });
  test('too short', () => {
    expect(validateLicenseNumber('12345')).toBe('Debe tener entre 6 y 15 dígitos.');
  });
  test('too long', () => {
    expect(validateLicenseNumber('1'.repeat(16))).toBe('Debe tener entre 6 y 15 dígitos.');
  });
  test('valid number (spaces around are ignored)', () => {
    expect(validateLicenseNumber(' 1234567890 ')).toBeNull();
  });
});

describe('validateExpiryDate', () => {
  test('missing date asks to select one', () => {
    expect(validateExpiryDate(null, TODAY)).toBe('Selecciona la fecha de vencimiento.');
  });
  test('today is not valid, whatever the hour', () => {
    expect(validateExpiryDate(new Date(2026, 10, 4, 23, 59), TODAY)).toBe(
      'La fecha de vencimiento debe ser posterior a hoy.',
    );
  });
  test('yesterday is rejected', () => {
    expect(validateExpiryDate(new Date(2026, 10, 3), TODAY)).toBe(
      'La fecha de vencimiento debe ser posterior a hoy.',
    );
  });
  test('tomorrow is valid', () => {
    expect(validateExpiryDate(new Date(2026, 10, 5), TODAY)).toBeNull();
  });
  test('more than 10 years ahead is rejected', () => {
    expect(validateExpiryDate(new Date(2036, 10, 5), TODAY)).toBe(
      'Revisa la fecha: no puede superar 10 años.',
    );
  });
  test('exactly 10 years ahead is valid', () => {
    expect(validateExpiryDate(new Date(2036, 10, 4), TODAY)).toBeNull();
  });
});

describe('isTechnicalInspectionRequired', () => {
  test('a 6-year-old vehicle needs it', () => {
    expect(isTechnicalInspectionRequired('2020', CURRENT_YEAR)).toBe(true);
  });
  test('a 5-year-old vehicle does not', () => {
    expect(isTechnicalInspectionRequired('2021', CURRENT_YEAR)).toBe(false);
  });
  test('a next-year model does not', () => {
    expect(isTechnicalInspectionRequired('2027', CURRENT_YEAR)).toBe(false);
  });
  test('an unknown year counts as required (strictest option)', () => {
    expect(isTechnicalInspectionRequired('', CURRENT_YEAR)).toBe(true);
    expect(isTechnicalInspectionRequired('abc', CURRENT_YEAR)).toBe(true);
  });
});

describe('validateTerms', () => {
  test('not accepted', () => {
    expect(validateTerms(false)).toBe('Debes aceptar los términos y la comisión de la plataforma.');
  });
  test('accepted', () => {
    expect(validateTerms(true)).toBeNull();
  });
  test('only a real true counts', () => {
    expect(validateTerms('true')).not.toBeNull();
  });
});

describe('validateDocumentsData', () => {
  test('complete data for a recent vehicle has no errors and no inspection errors', () => {
    const errors = validateDocumentsData(VALID_DATA, { vehicleYear: '2024', today: TODAY, currentYear: CURRENT_YEAR });
    expect(hasErrors(errors)).toBe(false);
    expect(errors.techPhoto).toBeNull();
    expect(errors.techExpiry).toBeNull();
  });
  test('an old vehicle without inspection documents gets both errors', () => {
    const errors = validateDocumentsData(VALID_DATA, { vehicleYear: '2018', today: TODAY, currentYear: CURRENT_YEAR });
    expect(errors.techPhoto).toBe('La foto de la revisión técnico-mecánica es obligatoria.');
    expect(errors.techExpiry).toBe('Selecciona la fecha de vencimiento.');
  });
  test('empty data: every one of the 9 fields has an error', () => {
    const empty = {
      licenseNumber: '', licensePhoto: null, licenseExpiry: null, soatPhoto: null, soatExpiry: null,
      techPhoto: null, techExpiry: null, mercadoPagoEmail: '', acceptedTerms: false,
    };
    const errors = validateDocumentsData(empty, { vehicleYear: '2018', today: TODAY, currentYear: CURRENT_YEAR });
    expect(Object.values(errors).filter(Boolean)).toHaveLength(9);
  });
  test('invalid Mercado Pago email', () => {
    const errors = validateDocumentsData(
      { ...VALID_DATA, mercadoPagoEmail: 'pagos@' },
      { vehicleYear: '2024', today: TODAY, currentYear: CURRENT_YEAR },
    );
    expect(errors.mercadoPagoEmail).toBe('Ingresa un correo válido (ej. nombre@dominio.com).');
  });
});