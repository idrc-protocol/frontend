import Link from "next/link";
import React from "react";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SelectFloating } from "@/components/ui/select-floating";
import { InputFloating } from "@/components/ui/input-floating";

export default function KycStep2({
  selectedCountry,
  otherCitizenships,
  setSelectedCountry,
  setOtherCitizenships,
  onNext,
  onBack,
}: {
  selectedCountry: string;
  otherCitizenships: string;
  setSelectedCountry: (value: string) => void;
  setOtherCitizenships: (value: string) => void;
  onNext?: () => void;
  onBack?: () => void;
}) {
  const isFormValid =
    selectedCountry &&
    typeof selectedCountry === "string" &&
    selectedCountry.trim() !== "";

  const handleContinue = () => {
    if (isFormValid && onNext) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      <button
        className="cursor-pointer hover:bg-gray-100 w-fit py-1.5 transition-all duration-200"
        onClick={onBack}
      >
        <ChevronLeft />
      </button>

      <div className="flex flex-col gap-5">
        <span className="text-black text-2xl font-semibold">
          Select the country of your citizenship that is same as the government
          ID you will provide.
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            You will be asked to upload an ID from this country in the next
            step. This needs to be an ID issued from the same country as your
            citizenship.
          </p>
          <SelectFloating
            label="Select your country"
            options={[
              { value: "indonesia", label: "Indonesia" },
              { value: "usa", label: "United States" },
              { value: "singapore", label: "Singapore" },
              { value: "uk", label: "United Kingdom" },
              { value: "australia", label: "Australia" },
              { value: "canada", label: "Canada" },
              { value: "germany", label: "Germany" },
              { value: "france", label: "France" },
              { value: "japan", label: "Japan" },
              { value: "other", label: "Other" },
            ]}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            List any other countries in which you have citizenship.
          </p>
          <InputFloating
            id="countryName"
            label="Type country name(s)"
            value={otherCitizenships}
            onChange={(e) => setOtherCitizenships(e.target.value)}
          />
        </div>
        <Button
          className="flex-1 text-md font-semibold py-5 mt-5"
          disabled={!isFormValid}
          variant="purple"
          onClick={handleContinue}
        >
          Select
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
