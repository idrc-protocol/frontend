import Link from "next/link";
import React from "react";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { InputFloating } from "@/components/ui/input-floating";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/ui/phone-input";

export default function KycStep3({
  phoneNumber,
  birthdate,
  birthplace,
  address,
  state,
  zipCode,
  handlePhoneNumberChange,
  handleBirthdateChange,
  handleBirthplaceChange,
  handleAddressChange,
  handleStateChange,
  handleZipCodeChange,
  onNext,
  onBack,
}: {
  phoneNumber: string;
  birthdate: Date | undefined;
  birthplace: string;
  address: string;
  state: string;
  zipCode: string;
  handlePhoneNumberChange: (value: string) => void;
  handleBirthdateChange: (date: Date | undefined) => void;
  handleBirthplaceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleZipCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext?: () => void;
  onBack?: () => void;
}) {
  const isFormValid =
    phoneNumber &&
    typeof phoneNumber === "string" &&
    phoneNumber.trim() !== "" &&
    birthdate !== undefined &&
    birthplace &&
    birthplace.trim() !== "" &&
    address &&
    address.trim() !== "" &&
    state &&
    state.trim() !== "" &&
    zipCode &&
    zipCode.trim() !== "";

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
          Additional Information
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Enter the address where you currently reside. This address must
            match the address on your government-issued ID.
          </p>
          <InputFloating
            id="address"
            label="Address"
            value={address}
            onChange={handleAddressChange}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputFloating
              id="state"
              label="State/Province"
              value={state}
              onChange={handleStateChange}
            />
            <InputFloating
              id="zipCode"
              label="Zip Code"
              value={zipCode}
              onChange={handleZipCodeChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Provide a phone number where you can be reached.
          </p>
          <PhoneInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
          />
          <p className="text-sm">
            Provide a birthdate and place of birth as listed on your
            government-issued ID.
          </p>
          <div className="flex items-center gap-5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    "flex-1 w-full pl-3 text-left font-normal border-none bg-transparent shadow-none ring-1 ring-gray-200 rounded-xl h-14",
                    !birthdate && "text-muted-foreground",
                  )}
                  variant={"outline"}
                >
                  {birthdate ? (
                    format(birthdate, "PPP")
                  ) : (
                    <span>Birthdate</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  captionLayout="dropdown"
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  mode="single"
                  selected={birthdate}
                  onSelect={handleBirthdateChange}
                />
              </PopoverContent>
            </Popover>
            <InputFloating
              className="w-full flex-1"
              id="birthplace"
              label="Place of Birth"
              value={birthplace}
              onChange={handleBirthplaceChange}
            />
          </div>
        </div>
        <Button
          className="flex-1 text-md font-semibold py-5 mt-5"
          disabled={!isFormValid}
          variant="purple"
          onClick={handleContinue}
        >
          Continue
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
