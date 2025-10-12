import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { InputFloating } from "@/components/ui/input-floating";
import { SelectFloating } from "@/components/ui/select-floating";

export default function VerifyFirstStep({
  firstName,
  lastName,
  handleFirstNameChange,
  handleLastNameChange,
  investorType,
  setInvestorType,
  purchaseAmount,
  setPurchaseAmount,
  verificationType,
  setVerificationType,
  onNext,
}: {
  firstName: string;
  lastName: string;
  handleFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  investorType: string;
  setInvestorType: (type: string) => void;
  purchaseAmount: string;
  setPurchaseAmount: (amount: string) => void;
  verificationType: string;
  setVerificationType: (type: string) => void;
  onNext: () => void;
}) {
  const isHighValueInvestor = parseInt(purchaseAmount) >= 1000000;

  const handleContinue = () => {
    const baseFormValid =
      firstName.trim() && lastName.trim() && investorType && purchaseAmount;
    const verificationValid = !isHighValueInvestor || verificationType;

    if (baseFormValid && verificationValid) {
      onNext();
    }
  };

  const isFormValid = (() => {
    const baseValid =
      firstName.trim() && lastName.trim() && investorType && purchaseAmount;

    if (!baseValid) return false;

    if (isHighValueInvestor && !verificationType) return false;

    return true;
  })();

  return (
    <div className="flex flex-col gap-15 w-full max-w-md">
      <span className="text-black text-2xl font-semibold">
        Verify Your Identity
      </span>
      <div className="flex flex-col gap-2">
        <InputFloating
          id="firstName"
          label="First Name"
          value={firstName}
          onChange={handleFirstNameChange}
        />
        <InputFloating
          id="lastName"
          label="Last Name"
          value={lastName}
          onChange={handleLastNameChange}
        />
        <SelectFloating
          options={[
            { value: "consumer", label: "Consumer" },
            { value: "business", label: "Business" },
          ]}
          placeholder="Investor Type"
          value={investorType}
          onChange={(e) => setInvestorType(e.target.value)}
        />
        <SelectFloating
          options={[
            { value: "10000", label: "$0-$10k" },
            { value: "50000", label: "$10k-$50k" },
            { value: "100000", label: "$50k-$100k" },
            { value: "250000", label: "$100k-$250k" },
            { value: "500000", label: "$250k-$500k" },
            { value: "1000000", label: "$500k-$1M" },
            { value: "2500000", label: "$1M-$2.5M" },
            { value: "5000000", label: "$2.5M-$5M" },
            { value: "10000000", label: "$5M-$10M" },
            { value: "100000000", label: "$10M-$50M" },
            { value: "500000000", label: "$50M+" },
          ]}
          placeholder="Likely Purchase Amount"
          value={purchaseAmount}
          onChange={(e) => setPurchaseAmount(e.target.value)}
        />

        {isHighValueInvestor && (
          <SelectFloating
            options={[
              {
                value: "STANDARD",
                label: "Standard Verification",
              },
              {
                value: "OTC",
                label: "OTC Verification",
              },
              {
                value: "INTERNAL",
                label: "Internal Verification",
              },
            ]}
            placeholder="Select Verification Type"
            value={verificationType}
            onChange={(e) => setVerificationType(e.target.value)}
          />
        )}

        <p className="text-sm">
          *Non-binding. This helps us understand our clients better.
        </p>
        <Button
          className="flex-1 text-md font-semibold py-5 mt-5"
          disabled={!isFormValid}
          variant="purple"
          onClick={handleContinue}
        >
          Continue
        </Button>
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
    </div>
  );
}
