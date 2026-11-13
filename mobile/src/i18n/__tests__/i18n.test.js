// AI-assisted: see docs/AI_LOG.md #21
import { TRANSLATIONS, defaultT, getLocale, translate } from '../index';

describe('translate', () => {
  test('Spanish text', () => {
    expect(translate('es', 'drawer.home')).toBe('Inicio');
  });
  test('English text', () => {
    expect(translate('en', 'drawer.home')).toBe('Home');
  });
  test('unknown language falls back to Spanish', () => {
    expect(translate('fr', 'drawer.home')).toBe('Inicio');
  });
  test('unknown key returns the key instead of a blank text', () => {
    expect(translate('es', 'does.not.exist')).toBe('does.not.exist');
  });
  test('replaces parameters', () => {
    expect(translate('en', 'home.greeting', { name: 'Santiago' })).toBe('Hi, Santiago');
  });
  test('both languages have exactly the same keys', () => {
    expect(Object.keys(TRANSLATIONS.en).sort()).toEqual(Object.keys(TRANSLATIONS.es).sort());
  });
});

describe('helpers', () => {
  test('defaultT is Spanish and getLocale maps each language', () => {
    expect(defaultT('login.submit')).toBe('Iniciar sesión');
    expect(getLocale('en')).toBe('en-US');
    expect(getLocale('xx')).toBe('es-CO');
  });
});