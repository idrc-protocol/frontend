"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { InputFloating } from "@/components/ui/input-floating";

export function SignUpForm() {
  const router = useRouter();
  const t = useTranslations("Auth.Register");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");

      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        username,
      });

      if (error) {
        let errorMessage = "Failed to sign up";

        if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = "Invalid input. Please check your information.";
        } else if (error.status === 409) {
          errorMessage = "This email or username is already registered";
        }

        toast.error(errorMessage);

        return;
      }

      if (data) {
        toast.success("Account created successfully!");
        router.push("/account/overview");
        router.refresh();
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
      <div className="flex flex-col sm:flex-row gap-3">
        <InputFloating
          required
          disabled={isLoading}
          id="firstName"
          label={t("firstNameLabel")}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <InputFloating
          required
          disabled={isLoading}
          id="lastName"
          label={t("lastNameLabel")}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <InputFloating
        required
        disabled={isLoading}
        id="username"
        label={t("usernameLabel")}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <InputFloating
        required
        disabled={isLoading}
        id="email"
        label={t("emailLabel")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputFloating
        required
        disabled={isLoading}
        id="password"
        label={t("passwordLabel")}
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
        {isLoading ? t("creatingAccountButton") : t("createAccountButton")}
      </Button>
    </form>
  );
}
