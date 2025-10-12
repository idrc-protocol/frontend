"use client";
import type { Locale } from "../i18n/request";

import React, { useEffect, useState } from "react";
import { LanguagesIcon, X, Cookie } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { useLocaleContext } from "../contexts/locale-context";
import { localeFlags, localeNames, supportedLocales } from "../lib/i18n-utils";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const savePreferences = (prefs: CookiePreferences) => {
  localStorage.setItem("idrc_cookie_consent", JSON.stringify(prefs));
  localStorage.setItem("idrc_cookie_consent_timestamp", Date.now().toString());
  window.dispatchEvent(
    new CustomEvent("cookieConsentUpdated", {
      detail: prefs,
    }),
  );
  if (prefs.functional) {
    document.body.setAttribute("data-locale-cookies-allowed", "true");
  } else {
    document.cookie =
      "ORBITUM_LOCALE=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.body.setAttribute("data-locale-cookies-allowed", "false");
  }
};

function CookieOverlay({
  onAcceptAll,
  onAcceptFunctional,
  onDecline,
}: {
  onAcceptAll: () => void;
  onAcceptFunctional: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="bg-black/70 w-screen h-svh fixed left-0 top-0 z-50 flex items-start justify-end p-5">
      <div className="relative w-full bg-white border rounded-xl shadow-sm p-5 max-w-xs">
        <button
          className="absolute top-3 right-3 text-black hover:text-gray-600 transition-colors"
          onClick={onDecline}
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Cookie className="text-black" size={20} />
          <h3 className="text-base font-semibold text-black">
            Cookie Settings
          </h3>
        </div>

        <p className="text-sm text-gray-800 mb-4 leading-relaxed">
          We use cookies to remember your language preferences. Choose your
          option below:
        </p>

        <div className="flex flex-col gap-2">
          <button
            className="w-full bg-black text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={onAcceptFunctional}
          >
            Functional Only
          </button>

          <button
            className="w-full border border-black text-black text-sm font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onAcceptAll}
          >
            Accept All
          </button>

          <button
            className="w-full text-sm text-gray-600 hover:text-black transition-colors"
            onClick={onDecline}
          >
            Decline
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Change anytime in settings
        </p>
      </div>
    </div>
  );
}

export default function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, isLoading } = useLocaleContext();
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null,
  );
  const [showOverlay, setShowOverlay] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);
  const [hasCheckedConsent, setHasCheckedConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("idrc_cookie_consent");

    if (consent) {
      setPreferences(JSON.parse(consent));
    } else {
      setPreferences(null);
      setShowOverlay(true);
    }
    setHasCheckedConsent(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    if (!preferences?.functional) {
      setPendingLocale(newLocale);
      setShowOverlay(true);

      return;
    }
    setLocale(newLocale as Locale);
  };

  const acceptFunctional = () => {
    const updated: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false,
    };

    savePreferences(updated);
    setPreferences(updated);

    if (pendingLocale) setLocale(pendingLocale as Locale);

    setShowOverlay(false);
    setPendingLocale(null);
  };

  const acceptAll = () => {
    const updated: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };

    savePreferences(updated);
    setPreferences(updated);

    if (pendingLocale) setLocale(pendingLocale as Locale);

    setShowOverlay(false);
    setPendingLocale(null);
  };

  const decline = () => {
    setShowOverlay(false);
    setPendingLocale(null);
  };

  if (isLoading || !locale || !hasCheckedConsent) {
    return (
      <div className={className}>
        <div className="w-full h-14 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-center gap-2">
          <Select value={locale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="min-w-[40px]">
              <LanguagesIcon />
            </SelectTrigger>
            <SelectContent>
              {supportedLocales.map((loc) => (
                <SelectItem
                  key={loc}
                  className="flex items-center gap-1"
                  value={loc}
                >
                  <span className="mt-0.5">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showOverlay && (
        <CookieOverlay
          onAcceptAll={acceptAll}
          onAcceptFunctional={acceptFunctional}
          onDecline={decline}
        />
      )}
    </>
  );
}
