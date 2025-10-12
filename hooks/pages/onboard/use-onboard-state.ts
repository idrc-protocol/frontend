import { useState } from "react";

import {
  KycStepType,
  OnboardStep,
  VerificationFlow,
} from "@/types/pages/onboard.type";

export const useOnboardState = () => {
  const [currentStep, setCurrentStep] = useState<OnboardStep>("verify");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [verificationFlow, setVerificationFlow] =
    useState<VerificationFlow>("initial");
  const [kycStep, setKycStep] = useState<KycStepType>(1);

  const isStepCompleted = (step: string) => completedSteps.includes(step);
  const isStepActive = (step: OnboardStep) => currentStep === step;

  const completeStep = (step: string) => {
    setCompletedSteps((prev) => [...prev, step]);
  };

  return {
    currentStep,
    setCurrentStep,
    completedSteps,
    verificationFlow,
    setVerificationFlow,
    kycStep,
    setKycStep,
    isStepCompleted,
    isStepActive,
    completeStep,
  };
};
