"use client";

import type { Locale } from "../i18n/request";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCookieConsent } from "../hooks/use-cookie-consent";

interface LocaleContextType {
  locale: Locale | null;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
  canSetLocale: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { canUseFunctionalCookies, isLoading: consentLoading } =
    useCookieConsent();

  useEffect(() => {
    if (consentLoading) return;

    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ORBITUM_LOCALE="))
      ?.split("=")[1] as Locale;

    if (cookieLocale && canUseFunctionalCookies()) {
      setLocaleState(cookieLocale);
    } else if (!canUseFunctionalCookies()) {
      const browserLocale = navigator.language.slice(0, 2) as Locale;
      const supportedLocales = ["en", "es", "fr"];
      const finalLocale = supportedLocales.includes(browserLocale)
        ? browserLocale
        : "en";

      setLocaleState(finalLocale as Locale);
    } else {
      const browserLocale = navigator.language.slice(0, 2) as Locale;
      const supportedLocales = ["en", "es", "fr"];
      const finalLocale = supportedLocales.includes(browserLocale)
        ? browserLocale
        : "en";

      setLocaleState(finalLocale as Locale);
      document.cookie = `ORBITUM_LOCALE=${finalLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    setIsLoading(false);
  }, [canUseFunctionalCookies, consentLoading]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);

    if (canUseFunctionalCookies()) {
      document.cookie = `ORBITUM_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    router.refresh();
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        isLoading,
        canSetLocale: canUseFunctionalCookies(),
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);

  if (context === undefined) {
    throw new Error("useLocaleContext must be used within a LocaleProvider");
  }

  return context;
}
