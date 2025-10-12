"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InputFloating } from "@/components/ui/input-floating";
import { resetPassword } from "@/lib/auth-client";
import LocaleSwitcher from "@/components/locale-switcher";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth.ResetPassword");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      toast.error("Invalid reset link");
      router.push("/auth/login");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");

      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");

      return;
    }

    if (!token) {
      toast.error("Invalid reset token");

      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");

        return;
      }

      toast.success("Password reset successfully! Redirecting...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="relative flex items-start lg:items-center justify-center px-5 lg:p-8 min-h-screen">
      <div className="absolute top-5 right-5">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-md space-y-8 py-10">
        <div className="flex flex-col items-start justify-center text-start lg:text-left gap-1">
          <h1 className="text-2xl lg:text-3xl font-semibold text-black">
            {t("title")}
          </h1>
          <p className="text-gray-500 text-md">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 px-0.5">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <InputFloating
              required
              disabled={isLoading}
              id="password"
              label={t("newPasswordLabel")}
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputFloating
              required
              disabled={isLoading}
              id="confirmPassword"
              label={t("confirmPasswordLabel")}
              minLength={8}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              className="w-full mt-2 py-7 text-md"
              disabled={isLoading}
              type="submit"
              variant="default"
            >
              {isLoading ? t("resettingButton") : t("resetButton")}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1 text-sm">
            <span>{t("rememberPassword")}</span>
            <Link
              className="text-black underline cursor-pointer"
              href="/auth/login"
            >
              {t("signInLink")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
