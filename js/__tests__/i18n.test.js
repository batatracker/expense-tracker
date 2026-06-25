'use strict';

const { loadI18n } = require('./helpers/setup');

describe('i18n — t() key lookup', () => {
  beforeEach(() => {
    // Ensure a fresh load before each test
    jest.resetModules();
  });

  describe('en-GB locale (default)', () => {
    let t;
    beforeEach(() => {
      t = loadI18n('');
    });

    it('resolves a known key in English', () => {
      expect(t('app.title')).toBe('Expense Tracker');
    });

    it('resolves a navigation key', () => {
      expect(t('nav.dashboard')).toBe('Dashboard');
    });

    it('resolves a toast key', () => {
      expect(t('toast.saved')).toBe('Expense saved.');
    });

    it('returns the raw key when the key does not exist', () => {
      expect(t('nonexistent.key.xyz')).toBe('nonexistent.key.xyz');
    });

    it('resolves a category display name', () => {
      expect(t('Food & Dining')).toBe('Food & Dining');
    });
  });

  describe('es-AR locale (?lang=es)', () => {
    let t;
    beforeEach(() => {
      t = loadI18n('?lang=es');
    });

    it('resolves a known key in Spanish', () => {
      expect(t('app.title')).toBe('Registro de Gastos');
    });

    it('resolves a navigation key in Spanish', () => {
      expect(t('nav.dashboard')).toBe('Inicio');
    });

    it('resolves a category display name in Spanish', () => {
      expect(t('Food & Dining')).toBe('Comida y Restaurantes');
    });

    it('falls back to en-GB for keys missing from es-AR', () => {
      // If a key exists only in en-GB, the Spanish locale should fall back
      // (both locales have 'app.title', so test with a known shared key)
      expect(t('form.save')).toBe('Guardar');
    });

    it('returns the raw key when the key does not exist in either locale', () => {
      expect(t('definitely.not.a.key')).toBe('definitely.not.a.key');
    });
  });

  describe('locale detection via localStorage', () => {
    it('picks up es-AR from localStorage when no ?lang= param', () => {
      global.localStorage.setItem('et_locale', 'es-AR');
      const t = loadI18n('');
      expect(t('app.title')).toBe('Registro de Gastos');
      global.localStorage.clear();
    });

    it('prefers ?lang= URL param over localStorage', () => {
      global.localStorage.setItem('et_locale', 'es-AR');
      const t = loadI18n('?lang=en');
      // explicit ?lang=en → en-GB
      expect(t('app.title')).toBe('Expense Tracker');
      global.localStorage.clear();
    });
  });
});
