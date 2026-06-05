import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS } from '../lib/translations';
import type { LangCode, T } from '../lib/translations';

interface AppContextType {
  darkMode: boolean;
  language: LangCode;
  t: T;
  setDarkMode: (v: boolean) => void;
  setLanguage: (lang: LangCode) => void;
}

const AppContext = createContext<AppContextType>({
  darkMode: false, language: 'en', t: TRANSLATIONS.en,
  setDarkMode: () => {}, setLanguage: () => {},
});

const DM_KEY = 'waygo_dark';
const LANG_KEY = 'waygo_lang';

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState<boolean>(() => localStorage.getItem(DM_KEY) === 'true');
  const [language, setLanguageState] = useState<LangCode>(() => (localStorage.getItem(LANG_KEY) as LangCode) || 'en');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    localStorage.setItem(DM_KEY, String(v));
    if (v) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const setLanguage = (lang: LangCode) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const t = TRANSLATIONS[language] as T;

  return (
    <AppContext.Provider value={{ darkMode, language, t, setDarkMode, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
