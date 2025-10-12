"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputFloating } from "@/components/ui/input-floating";
import { forgetPassword } from "@/lib/auth-client";

interface ForgotPasswordFormProps {
  children: React.ReactNode;
}

export default function ForgotPasswordForm({
  children,
}: ForgotPasswordFormProps) {
  const t = useTranslations("Auth.ForgotPassword");
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await forgetPassword({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");

        return;
      }

      toast.success("Password reset link sent! Check your email.");
      setIsOpen(false);
      setEmail("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputFloating
            required
            disabled={isLoading}
            id="forgot-password-email"
            label={t("emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {t("cancelButton")}
            </Button>
            <Button className="flex-1" disabled={isLoading} type="submit">
              {isLoading ? t("sendingButton") : t("sendButton")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
