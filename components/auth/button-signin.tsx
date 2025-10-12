"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

import FallbackImage from "../fallback-image";

export default function ButtonSignin() {
  const t = useTranslations("Auth.ButtonSignin");
  const [isLoading, setIsLoading] = useState(false);

  const baseButtonClass = "w-full h-14 text-md flex items-center gap-2";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/account/overview",
      });
    } catch {
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className={baseButtonClass} variant="outline">
        <FallbackImage
          alt={t("googleLogoAlt")}
          className="h-6 w-6"
          height={64}
          src="/images/icons/google.webp"
          width={64}
        />
        {t("signingIn")}
      </Button>
    );
  }

  return (
    <Button
      className={baseButtonClass}
      variant="outline"
      onClick={handleGoogleSignIn}
    >
      <FallbackImage
        alt={t("googleLogoAlt")}
        className="h-6 w-6"
        height={64}
        src="/images/icons/google.webp"
        width={64}
      />
      {t("continueWithGoogle")}
    </Button>
  );
}
