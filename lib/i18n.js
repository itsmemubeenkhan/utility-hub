import en from './i18n/en.js';
import es from './i18n/es.js';

const DICTS = { en, es };

export function getDict(lang) {
  return DICTS[lang] || en;
}

export const LOCALES = ['en', 'es'];
export const DEFAULT_LOCALE = 'en';
