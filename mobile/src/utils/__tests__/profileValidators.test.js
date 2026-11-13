// AI-assisted: see docs/AI_LOG.md #21
import { buildProfileUpdate, hasProfileChanges, validateProfileData } from '../profileValidators';
import { hasErrors } from '../validators';

const VALID = { fullName: 'Santiago Cadavid', phone: '3001234567', gender: 'male' };

describe('validateProfileData', () => {
  test('valid profile has no errors', () => {
    expect(hasErrors(validateProfileData(VALID))).toBe(false);
  });
  test('phone must start with 3', () => {
    expect(validateProfileData({ ...VALID, phone: '2001234567' }).phone).toBe('El celular debe empezar por 3.');
  });
  test('gender is required', () => {
    expect(validateProfileData({ ...VALID, gender: null }).gender).toBe('Selecciona un género.');
  });
});

describe('buildProfileUpdate', () => {
  test('only editable fields, trimmed', () => {
    const update = buildProfileUpdate({ ...VALID, fullName: '  Santiago Cadavid  ', email: 'x@y.com' });
    expect(update.fullName).toBe('Santiago Cadavid');
    expect(Object.keys(update).sort()).toEqual(['fullName', 'gender', 'phone']);
  });
});

describe('hasProfileChanges', () => {
  test('spaces only do not count as a change', () => {
    expect(hasProfileChanges(VALID, { ...VALID, fullName: ' Santiago Cadavid ' })).toBe(false);
  });
  test('a different phone is a change', () => {
    expect(hasProfileChanges(VALID, { ...VALID, phone: '3109876543' })).toBe(true);
  });
});