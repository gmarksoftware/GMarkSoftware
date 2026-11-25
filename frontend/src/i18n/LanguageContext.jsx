import { createContext, useContext, useEffect, useMemo } from 'react';
import { content } from './content.js';

export const LANGUAGES = [{ code: 'en', label: 'English' }];
const DEFAULT_LANG = 'en';
const STORAGE_KEY = 'gg-lang';

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const noopSetLang = () => { };

const fallbackContextValue = {
  lang: DEFAULT_LANG,
  setLang: noopSetLang,
  toggleLanguage: noopSetLang,
  t: (path, fallback) => {
    const val = get(content.en, path);
    if (val !== undefined && val !== null) return val;
    return fallback !== undefined ? fallback : path;
  },
  tr: (item, field) => {
    if (!item) return '';
    return item[`${field}En`] || item[field] || '';
  },
};

const LanguageContext = createContext(fallbackContextValue);

export function LanguageProvider({ children }) {
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = DEFAULT_LANG;
    }
  }, []);

  const value = useMemo(
    () => ({
      lang: DEFAULT_LANG,
      setLang: noopSetLang,
      toggleLanguage: noopSetLang,
      /** t('home.title', 'Fallback') → English string / array / object or fallback/path. */
      t: (path, fallback) => {
        const val = get(content.en, path);
        if (val !== undefined && val !== null) return val;
        return fallback !== undefined ? fallback : path;
      },
      /** Pick the English variant of a database record: tr(item,'title') → titleEn || title. */
      tr: (item, field) => {
        if (!item) return '';
        return item[`${field}En`] || item[field] || '';
      },
    }),
    []
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext) || fallbackContextValue;

export function LanguageSwitch() {
  return null;
}

