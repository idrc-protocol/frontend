"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";

import ButtonSignin from "@/components/auth/button-signin";
import { SignUpForm } from "@/components/auth/sign-up-form";
import LocaleSwitcher from "@/components/locale-switcher";

export default function Register() {
  const t = useTranslations("Auth.Register");

  return (
    <div className="relative flex items-start lg:items-start justify-center px-5 lg:p-8 h-full">
      <div className="absolute top-5 right-5">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-md space-y-8 py-10 overflow-y-auto">
        <div className="flex flex-col items-start justify-center text-start lg:text-left gap-1">
          <h1 className="text-2xl lg:text-3xl font-semibold text-black">
            {t("title")}
          </h1>
          <p className="text-gray-500 text-md">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 px-0.5">
          <div className="pt-2">
            <ButtonSignin />
          </div>

          <span className="text-center text-sm">{t("orDivider")}</span>

          <SignUpForm />

          <div className="flex items-center justify-center gap-1 text-sm">
            <span>{t("hasAccountText")}</span>
            <Link
              className="text-black underline cursor-pointer"
              href="/auth/login"
            >
              {t("signInLink")}
            </Link>
          </div>

          <div className="flex flex-col gap-2 mt-5">
            <p className="text-xs lg:text-sm text-gray-500 text-left lg:text-left leading-relaxed">
              {t("privacyText")}{" "}
              <Link className="underline transition-colors" href="#">
                {t("privacyPolicyLink")}
              </Link>{" "}
              {t("termsText")}{" "}
              <Link className="underline transition-colors" href="#">
                {t("termsOfServiceLink")}
              </Link>
              .
            </p>

            <p className="text-xs lg:text-sm text-gray-500 text-left lg:text-left">
              {t("needHelpText")}{" "}
              <a
                className="underline transition-colors"
                href={`mailto:${t("supportEmail")}`}
              >
                {t("supportEmail")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
