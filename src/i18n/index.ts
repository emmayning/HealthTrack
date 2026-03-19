import { createContext, useContext } from 'react';
import type { Language } from '../types';
import en from './en';
import zh from './zh';

const translations: Record<Language, Record<string, string>> = { en, zh };

export const I18nContext = createContext<Language>('en');

export function useTranslation() {
  const lang = useContext(I18nContext);
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[lang][key] || translations['en'][key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
  return { t, lang };
}
