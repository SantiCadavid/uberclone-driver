// AI-assisted: see docs/AI_LOG.md #22
import { translate, translateOptions } from '../../i18n';
import { GENDER_OPTIONS, VEHICLE_CATEGORY_OPTIONS, VEHICLE_COLOR_OPTIONS } from '../../config/registration';
import { validateCapacity, validatePhone, validateRequired } from '../validators';
import { validateExpiryDate } from '../documentValidators';

const tEn = (key, params) => translate('en', key, params);

describe('validators in English', () => {
  test('required message', () => {
    expect(validateRequired('', tEn)).toBe('This field is required.');
  });
  test('message with a parameter', () => {
    expect(validatePhone('2001234567', tEn)).toBe('The mobile number must start with 3.');
  });
  test('capacity message uses the translated category name', () => {
    expect(validateCapacity('6', 'economy', tEn)).toBe('The Economy category allows at most 4 passengers.');
  });
  test('document expiry message', () => {
    expect(validateExpiryDate(new Date(2026, 10, 4), new Date(2026, 10, 4), tEn)).toBe(
      'The expiry date must be later than today.',
    );
  });
  test('without t the message stays in Spanish (default)', () => {
    expect(validateRequired('')).toBe('Este campo es obligatorio.');
  });
});

describe('translated options', () => {
  test('translateOptions returns the label in the chosen language', () => {
    expect(translateOptions(GENDER_OPTIONS, tEn)[0]).toEqual({ value: 'female', label: 'Female' });
  });
  test('every option key exists in both dictionaries', () => {
    const keys = [...GENDER_OPTIONS, ...VEHICLE_CATEGORY_OPTIONS, ...VEHICLE_COLOR_OPTIONS].map((o) => o.labelKey);
    keys.forEach((key) => {
      expect(translate('es', key)).not.toBe(key);
      expect(translate('en', key)).not.toBe(key);
    });
  });
});