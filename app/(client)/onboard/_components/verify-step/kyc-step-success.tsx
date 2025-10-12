"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/fallback-image";

export default function KycStepSuccess({
  onNext,
  verificationType = "STANDARD",
}: {
  onNext?: () => void;
  verificationType?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/kyc-verified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update KYC status");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("KYC verification completed!");

        if (onNext) {
          onNext();
        }
      } else {
        throw new Error(data.error || "Failed to update KYC status");
      }
    } catch {
      toast.error("Failed to update verification status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      <div className="flex flex-col gap-5">
        <span className="text-black text-2xl font-semibold">
          {verificationType === "OTC" || verificationType === "INTERNAL"
            ? "Verification Type Selected"
            : "Verification Successfully"}
        </span>
        <div className="flex flex-col gap-5">
          <p className="text-sm">
            {verificationType === "OTC"
              ? "You have selected OTC verification. Our team will contact you to proceed with the verification process."
              : verificationType === "INTERNAL"
                ? "You have selected Internal verification. Our team will review your information and contact you with next steps."
                : "Your identity has been successfully verified."}
          </p>
          <div className="w-full flex items-center justify-center">
            <FallbackImage
              alt={"Card Image"}
              className="w-36 h-auto"
              height={500}
              src={"/images/icons/card-with-check.webp"}
              width={700}
            />
          </div>
        </div>
        <Button
          className="flex-1 text-md font-semibold py-5 mt-5"
          disabled={isLoading}
          variant="purple"
          onClick={handleContinue}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>

      <p className="text-sm text-start mt-2">
        Get assistance via{" "}
        <Link
          className="underline"
          href="mailto:support@idrc.site"
          target="_blank"
        >
          support@idrc.site
        </Link>
      </p>
    </div>
  );
}
