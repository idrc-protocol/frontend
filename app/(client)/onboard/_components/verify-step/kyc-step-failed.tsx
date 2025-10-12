import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import FallbackImage from "@/components/fallback-image";

interface ValidationError {
  field: string;
  expectedValue: string;
  actualValue: string;
  message: string;
}

interface KycStepFailedProps {
  onRetry?: () => void;
  validationErrors?: ValidationError[];
  title?: string;
  description?: string;
}

export default function KycStepFailed({
  onRetry,
  validationErrors = [],
  title = "Verification Failed",
  description = "We found some issues with your submitted information.",
}: KycStepFailedProps) {
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      <div className="flex flex-col gap-5">
        <span className="text-black text-2xl font-semibold">{title}</span>
        <div className="flex flex-col gap-5">
          <p className="text-sm">{description}</p>

          <div className="w-full flex items-center justify-center">
            <FallbackImage
              alt={"Card Image"}
              className="w-36 h-auto"
              height={500}
              src={"/images/icons/card-with-x.webp"}
              width={700}
            />
          </div>

          {hasValidationErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-red-800">
                Issues found:
              </h4>
              {validationErrors.map((error, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium text-red-700 capitalize">
                      {error.field} mismatch
                    </span>
                  </div>
                  <p className="text-xs text-red-600 ml-4">{error.message}</p>
                  <div className="text-xs text-gray-600 ml-4 space-y-1">
                    <div>
                      Expected:{" "}
                      <span className="font-medium">{error.expectedValue}</span>
                    </div>
                    <div>
                      Found:{" "}
                      <span className="font-medium text-red-600">
                        {error.actualValue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasValidationErrors && (
            <p className="text-sm">
              Please follow these tips to help us verify your identity. Is your
              ID issued from the same country as your selected citizenship?
            </p>
          )}
        </div>

        <Button
          className="flex-1 text-md font-semibold py-5 mt-5"
          variant="purple"
          onClick={onRetry}
        >
          Retry Verification
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
