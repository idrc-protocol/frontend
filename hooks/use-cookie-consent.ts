"use client";
import { useState, useEffect } from "react";

import { CookiePreferences } from "@/components/locale-switcher";

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = () => {
      const consent = localStorage.getItem("idrc_cookie_consent");

      if (consent) {
        setPreferences(JSON.parse(consent));
      }
      setIsLoading(false);
    };

    loadPreferences();

    const handleConsentUpdate = (event: CustomEvent) => {
      setPreferences(event.detail);
    };

    window.addEventListener(
      "cookieConsentUpdated",
      handleConsentUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "cookieConsentUpdated",
        handleConsentUpdate as EventListener,
      );
    };
  }, []);

  const canUseFunctionalCookies = () => {
    return preferences?.functional ?? false;
  };

  const canUseAnalyticsCookies = () => {
    return preferences?.analytics ?? false;
  };

  const canUseMarketingCookies = () => {
    return preferences?.marketing ?? false;
  };

  const updatePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem("idrc_cookie_consent", JSON.stringify(newPreferences));
    localStorage.setItem(
      "idrc_cookie_consent_timestamp",
      Date.now().toString(),
    );
    setPreferences(newPreferences);

    window.dispatchEvent(
      new CustomEvent("cookieConsentUpdated", {
        detail: newPreferences,
      }),
    );
  };

  return {
    preferences,
    isLoading,
    canUseFunctionalCookies,
    canUseAnalyticsCookies,
    canUseMarketingCookies,
    updatePreferences,
  };
}
