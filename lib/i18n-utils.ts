import type { Locale } from "../i18n/request";

export const supportedLocales: Locale[] = ["en", "id"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  id: "🇮🇩",
};

export const localeSymbols: Record<Locale, string> = {
  en: "EN",
  id: "ID",
};

/**
 * Get locale from cookie (client-side only)
 */
export function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return "en";

  const cookieLocale = document.cookie
    .split("; ")
    .find((row) => row.startsWith("ORBITUM_LOCALE="))
    ?.split("=")[1] as Locale;

  return cookieLocale && supportedLocales.includes(cookieLocale)
    ? cookieLocale
    : "en";
}

/**
 * Set locale cookie with proper settings
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;

  document.cookie = `ORBITUM_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Get the best matching locale based on browser language
 */
export function getBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const browserLocale = navigator.language.slice(0, 2) as Locale;

  return supportedLocales.includes(browserLocale) ? browserLocale : "en";
}
