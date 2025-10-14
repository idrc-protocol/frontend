"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { InputFloating } from "@/components/ui/input-floating";

import ForgotPasswordForm from "./forgot-password-form";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("Auth.Login");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEmail = emailOrUsername.includes("@");

      const { data, error } = isEmail
        ? await authClient.signIn.email({
            email: emailOrUsername,
            password,
          })
        : await authClient.signIn.username({
            username: emailOrUsername,
            password,
          });

      if (error) {
        let errorMessage = "Failed to sign in";

        if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = "Invalid email/username or password";
        } else if (error.status === 404) {
          errorMessage = "Account not found";
        } else if (error.status === 401) {
          errorMessage = "Incorrect password";
        }

        toast.error(errorMessage);

        return;
      }

      if (data) {
        router.push("/account/overview");
        router.refresh();
        window.location.reload();
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || "An unexpected error occurred. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <InputFloating
        required
        disabled={isLoading}
        id="emailOrUsername"
        label={t("emailOrUsernameLabel")}
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
      />
      <InputFloating
        required
        disabled={isLoading}
        id="password"
        label={t("passwordLabel")}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="w-full flex justify-end -mt-3">
        <ForgotPasswordForm>
          <span className="underline text-black text-sm cursor-pointer hover:opacity-80 transition-opacity">
            {t("forgotPasswordLink")}
          </span>
        </ForgotPasswordForm>
      </div>
      <Button
        className="w-full mt-2 py-7 text-md"
        disabled={isLoading}
        type="submit"
        variant="default"
      >
        {isLoading ? t("signingInButton") : t("signInButton")}
      </Button>
    </form>
  );
}
