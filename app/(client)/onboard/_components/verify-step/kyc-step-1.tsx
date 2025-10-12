import Link from "next/link";
import React from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/fallback-image";

export default function KycStep1({
  onNext,
  onBack,
}: {
  onNext?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <button
        className="cursor-pointer hover:bg-gray-100 w-fit py-1.5 transition-all duration-200"
        onClick={onBack}
      >
        <ChevronLeft />
      </button>

      <div className="flex flex-col gap-5">
        <span className="text-black text-2xl font-semibold">
          IDRC | Consumer Verification
        </span>
        <p className="text-sm">
          We need some information to help us confirm your identity.
        </p>
        <div className="flex items-center justify-center w-full">
          <FallbackImage
            alt="KYC Icon"
            className="w-60 h-auto"
            height={256}
            src="/images/icons/kyc.webp"
            width={256}
          />
        </div>
        <p className="text-[10px]">
          By clicking the button below, you consent to Persona, our vendor,
          collecting, using, and utilizing its service providers to process your
          biometric information to verify your identity, identify fraud, and
          improve Persona’s platform in accordance with its{" "}
          <Link className="text-purple-700 underline" href="#" target="_blank">
            Privacy Policy
          </Link>
          . Your biometric information will be stored for no more than 3 years.
        </p>
        <Button
          className="flex-1 text-md font-semibold py-5"
          variant="purple"
          onClick={onNext}
        >
          Begin verifying
        </Button>
      </div>

      <div className="mt-10">
        <div className="bg-gray-100 p-3 px-5 pb-4 flex flex-col items-end">
          <span className="text-[10px] tracking-[1px] mb-1">SECURED WITH</span>
          <FallbackImage
            alt="KYC Icon"
            className="w-22 h-auto"
            height={256}
            src="/images/brands/sumsub.webp"
            width={256}
          />
        </div>
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
