import Link from "next/link";
import React from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputFloating } from "@/components/ui/input-floating";
import { SelectFloating } from "@/components/ui/select-floating";
import { PhoneInput } from "@/components/ui/phone-input";

interface KybStepProps {
  companyName: string;
  registrationNumber: string;
  businessAddress: string;
  contactPhone: string;
  ubo: string;
  legalRegistrationType: string;
  setCompanyName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setRegistrationNumber: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setBusinessAddress: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setContactPhone: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setUbo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setLegalRegistrationType: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function KybStep({
  companyName,
  registrationNumber,
  businessAddress,
  contactPhone,
  ubo,
  legalRegistrationType,
  setCompanyName,
  setRegistrationNumber,
  setBusinessAddress,
  setContactPhone,
  setUbo,
  setLegalRegistrationType,
  onBack,
  onSubmit,
}: KybStepProps) {
  const isFormValid =
    companyName.trim() !== "" &&
    registrationNumber.trim() !== "" &&
    businessAddress.trim() !== "" &&
    contactPhone.trim() !== "" &&
    ubo.trim() !== "" &&
    legalRegistrationType.trim() !== "";

  const handleContinue = () => {
    if (isFormValid && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <button
        className="cursor-pointer hover:bg-gray-100 w-fit py-1.5 transition-all duration-200"
        onClick={onBack}
      >
        <ChevronLeft />
      </button>

      <div className="flex flex-col gap-2">
        <span className="text-black text-2xl font-semibold">
          Business Verification
        </span>
        <p className="text-gray-600 text-sm">
          Please provide your business information for entity verification
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <InputFloating
          id="companyName"
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e)}
        />
        <InputFloating
          id="registrationNumber"
          label="Business Registration Number"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e)}
        />
        <InputFloating
          id="businessAddress"
          label="Business Address"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e)}
        />
        <PhoneInput
          placeholder="Contact Information"
          value={contactPhone}
          onChange={(e) => setContactPhone(e)}
        />
        <InputFloating
          id="ubo"
          label="Ultimate Beneficial Owner (UBO)"
          value={ubo}
          onChange={(e) => setUbo(e)}
        />
        <SelectFloating
          options={[
            { value: "LLC", label: "LLC" },
            { value: "Corporation", label: "Corporation" },
            { value: "Partnership", label: "Partnership" },
            { value: "Trust", label: "Trust" },
            { value: "Other", label: "Other" },
          ]}
          placeholder="Legal Registration Type"
          value={legalRegistrationType}
          onChange={setLegalRegistrationType}
        />
      </div>

      <div className="mt-6">
        <p className="text-black font-medium leading-6 mb-4">
          IDRC uses Sumsub, a secure, leading identity verification solution, to
          help us verify your business entity. The process will take around 5-10
          minutes.
        </p>

        <Button
          className="w-full text-md font-semibold py-8 mt-5"
          disabled={!isFormValid}
          variant="purple"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
      <p className="text-sm mt-4">
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
