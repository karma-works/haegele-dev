import { describe, it, expect } from 'vitest';
import {
  translations,
  languages,
  getNextLanguage,
  getTranslation,
  cycleTranslation,
} from '../../src/components/Navigation/translations';
import type { NavKey, Language } from '../../src/components/Navigation/translations';

describe('translations', () => {
  describe('getNextLanguage', () => {
    it('cycles through all languages', () => {
      expect(getNextLanguage('en')).toBe('de');
      expect(getNextLanguage('de')).toBe('es');
      expect(getNextLanguage('es')).toBe('fr');
      expect(getNextLanguage('fr')).toBe('ja');
      expect(getNextLanguage('ja')).toBe('en');
    });
  });

  describe('getTranslation', () => {
    it('returns correct translation', () => {
      expect(getTranslation('about', 'en')).toBe('About');
      expect(getTranslation('about', 'de')).toBe('Über mich');
      expect(getTranslation('about', 'ja')).toBe('自己紹介');
    });
  });

  describe('cycleTranslation', () => {
    it('returns next language translation', () => {
      expect(cycleTranslation('about', 'en')).toBe('Über mich');
      expect(cycleTranslation('skills', 'de')).toBe('Habilidades');
    });
  });

  describe('languages', () => {
    it('contains all languages', () => {
      expect(languages).toContain('en');
      expect(languages).toContain('de');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('ja');
    });
  });

  describe('translations', () => {
    it('has all nav keys', () => {
      const keys: NavKey[] = ['about', 'skills', 'projects', 'hobbies', 'contact'];
      keys.forEach((key) => {
        expect(translations[key]).toBeDefined();
        languages.forEach((lang) => {
          expect(translations[key][lang]).toBeDefined();
        });
      });
    });
  });
});
