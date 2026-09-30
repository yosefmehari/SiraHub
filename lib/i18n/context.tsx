"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionaries } from "./dictionaries";
import { SupportedLanguage } from "@/types";

type DictionaryType = typeof dictionaries.en;

interface I18nContextType {
  locale: SupportedLanguage;
  setLocale: (lang: SupportedLanguage) => void;
  t: DictionaryType;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: dictionaries.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sirahub_locale") as SupportedLanguage;
    if (saved && (saved === "en" || saved === "am" || saved === "ti")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (lang: SupportedLanguage) => {
    setLocaleState(lang);
    localStorage.setItem("sirahub_locale", lang);
  };

  const t = dictionaries[locale] || dictionaries.en;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
