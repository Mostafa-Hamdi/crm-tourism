"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import en from "../../locales/en.json";
import ar from "../../locales/ar.json";

type Locale = "en" | "ar";

type LocaleContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(
    (typeof window !== "undefined" &&
      (localStorage.getItem("locale") as Locale)) ||
      "en",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = (localStorage.getItem("locale") as Locale) || null;
      // fallback to browser locale if not saved
      let use = saved || locale;
      if (!saved) {
        const nav = (
          navigator.language ||
          (navigator.languages && navigator.languages[0]) ||
          "en"
        ).toLowerCase();
        use = nav.startsWith("ar") ? "ar" : "en";
        setLocaleState(use);
        try {
          localStorage.setItem("locale", use);
        } catch (e) {
          /* ignore */
        }
      }

      const dir = use === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = use;
      document.documentElement.dir = dir;
      document.body.dir = dir;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("locale", l);
      } catch (e) {
        /* ignore */
      }
      const dir = l === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = l;
      document.documentElement.dir = dir;
      document.body.dir = dir;
    }
  };

  const messages = {
    en,
    ar,
  } as const;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};

export const useIsRTL = () => {
  const { locale } = useLocale();
  return locale === "ar";
};
