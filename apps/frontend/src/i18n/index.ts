import { en } from './en';
import { hi } from './hi';
import { gu } from './gu';
import { LanguageCode } from '../types';

export const translations = {
  en,
  hi,
  gu,
};

export const getTranslation = (lang: LanguageCode = 'en') => {
  return translations[lang] || translations.en;
};

export { en, hi, gu };
