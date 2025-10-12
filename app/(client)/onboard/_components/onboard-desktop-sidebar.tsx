import { OnboardStep } from "@/types/pages/onboard.type";
import FallbackImage from "@/components/fallback-image";

import { StepIndicator } from "./step-indicator";

export const DesktopSidebar = ({
  isStepActive,
  isStepCompleted,
}: {
  isStepActive: (step: OnboardStep) => boolean;
  isStepCompleted: (step: string) => boolean;
}) => (
  <div className="bg-blue-700 text-white flex-shrink-0 lg:w-1/2 lg:min-h-screen lg:overflow-y-auto hidden lg:block">
    <div className="fixed top-0 left-0 px-4 pt-4 w-1/2 bg-gradient-to-b from-blue-700 from-80% to-transparent to-100% z-10">
      <FallbackImage
        alt="Logo"
        className="w-8 h-auto sm:w-10"
        height={200}
        src="/logo-white.png"
        width={200}
      />
    </div>

    <div className="flex px-12 xl:px-16 2xl:px-20 items-center justify-center w-full min-h-screen py-8">
      <div className="flex flex-col gap-5 w-full max-w-md">
        <span className="text-3xl font-semibold">Onboard Step</span>
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
);
