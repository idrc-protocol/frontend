import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { OnboardStep } from "@/types/pages/onboard.type";
import FallbackImage from "@/components/fallback-image";

import { StepIndicator } from "./step-indicator";

export const MobileProgress = ({
  isStepActive,
  isStepCompleted,
  showProgress,
  setShowProgress,
}: {
  isStepActive: (step: OnboardStep) => boolean;
  isStepCompleted: (step: string) => boolean;
  showProgress: boolean;
  setShowProgress: (show: boolean) => void;
}) => {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/account/overview");
    }
  };

  return (
    <div className="bg-blue-700 text-white relative z-20 -mb-5 pb-10 lg:pb-0">
      <div className="flex items-center justify-between px-4 py-4">
        <FallbackImage
          alt="Logo"
          className="w-8 h-auto"
          height={200}
          src="/logo-white.png"
          width={200}
        />
        <button
          className="cursor-pointer absolute top-5 right-5"
          onClick={handleClose}
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      <div className="flex w-full justify-center">
        <button
          className="flex w-full items-center max-w-md justify-between cursor-pointer"
          onClick={() => setShowProgress(!showProgress)}
        >
          <div className="flex items-center gap-2 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
            <span className="text-md sm:text-lg font-medium">See Progress</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${showProgress ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 9l-7 7-7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showProgress ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-6 flex flex-col justify-center w-full items-center">
          <div className="pt-4 px-3 max-w-md flex flex-col w-full">
            <span className="text-xl font-semibold mb-4 block">
              Onboard Progress
            </span>
            <ul className="flex flex-col gap-3">
              <StepIndicator
                isActive={isStepActive("verify")}
                isCompleted={isStepCompleted("verify")}
                label="Verify Your Identity"
                step="1"
              />
              <StepIndicator
                isActive={isStepActive("wallet")}
                isCompleted={isStepCompleted("wallet")}
                label="Add Your Wallet"
                step="2"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
