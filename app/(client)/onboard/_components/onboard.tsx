"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserData } from "@/hooks/pages/onboard/use-user-data";
import { useOnboardState } from "@/hooks/pages/onboard/use-onboard-state";
import { UserData } from "@/types/pages/onboard.type";
import { useMobile } from "@/hooks/window/useMobile";

import WalletFirstStep from "./wallet-step/wallet-first-step";
import VerifyFirstStep from "./verify-step/verify-first-step";
import KycStep1 from "./verify-step/kyc-step-1";
import KycStep2 from "./verify-step/kyc-step-2";
import KycStep3 from "./verify-step/kyc-step-3";
import KycStep4 from "./verify-step/kyc-step-4";
import KycStepLoading from "./verify-step/kyc-step-loading";
import KycStepSuccess from "./verify-step/kyc-step-success";
import KycStepFailed from "./verify-step/kyc-step-failed";
import KycSupportContact from "./verify-step/kyc-support-contact";
import KybStep from "./verify-step/kyb-step";
import { DesktopSidebar } from "./onboard-desktop-sidebar";
import { MobileProgress } from "./onboard-mobile-progress";
import OnboardSuccess from "./onboard-success";

function OnboardSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-svh">
      <div className="hidden lg:flex w-1/2 bg-blue-700 flex-col justify-center items-center p-12">
        <div className="flex flex-col gap-8 w-full max-w-md">
          <Skeleton className="h-8 w-48 bg-white/20" />
          <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-48 bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white flex-1 w-full lg:w-1/2 rounded-t-3xl lg:rounded-none shadow-xl lg:shadow-none z-20 lg:z-auto min-h-[50vh] lg:min-h-svh lg:overflow-y-auto">
        <div className="flex px-12 xl:px-16 2xl:px-20 items-center justify-center w-full h-full py-8">
          <div className="w-full max-w-lg flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Onboard() {
  const router = useRouter();
  const { isMobile } = useMobile();
  const queryClient = useQueryClient();
  const [showProgress, setShowProgress] = useState(false);
  const [actualCurrentStep, setActualCurrentStep] = useState<string | null>(
    null,
  );
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const { data: session, isPending } = useSession();

  const onboardState = useOnboardState();
  const { userData, updateUserData } = useUserData();

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (session?.user) {
      const checkOnboardingStatus = async () => {
        try {
          const [kycResponse, walletResponse] = await Promise.all([
            fetch("/api/user/kyc-status"),
            fetch("/api/user/wallet"),
          ]);

          const [kycData, walletData] = await Promise.all([
            kycResponse.json(),
            walletResponse.json(),
          ]);

          const hasKyc = kycData.kycVerified;
          const hasWallet = walletData.wallets && walletData.wallets.length > 0;

          if (hasKyc && hasWallet) {
            onboardState.completeStep("verify");
            onboardState.completeStep("wallet");
            onboardState.setCurrentStep("success");
            setActualCurrentStep("success");
            setIsReadyToRender(true);
          } else if (hasKyc) {
            onboardState.completeStep("verify");
            onboardState.setCurrentStep("wallet");
            setActualCurrentStep("wallet");
            setIsReadyToRender(true);
          } else {
            setActualCurrentStep("verify");
            setIsReadyToRender(true);
          }
        } catch {
          setActualCurrentStep("verify");
          setIsReadyToRender(true);
        }
      };

      checkOnboardingStatus();
    } else {
      setActualCurrentStep("verify");
      setIsReadyToRender(true);
    }
  }, [session, isPending]);

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/account/overview");
    }
  };

  const handleInitialVerifyNext = () => {
    if (userData.investorType === "consumer") {
      onboardState.setVerificationFlow("kyc");

      const isHighValue = parseInt(userData.purchaseAmount) >= 1000000;

      if (
        isHighValue &&
        (userData.verificationType === "OTC" ||
          userData.verificationType === "INTERNAL")
      ) {
        onboardState.setKycStep("support-contact");
      } else {
        onboardState.setKycStep(1);
      }
    } else if (userData.investorType === "business") {
      onboardState.setVerificationFlow("kyb");
    }
  };

  const handleWalletComplete = () => {
    onboardState.completeStep("wallet");
    onboardState.setCurrentStep("success");
    setActualCurrentStep("success");

    queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
    queryClient.invalidateQueries({ queryKey: ["kycStatus"] });
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.includes("wallet") ||
        query.queryKey.includes("kyc") ||
        query.queryKey.includes("onboarding"),
    });
  };

  const handleInputChange =
    (field: keyof UserData) =>
    (
      value: string | Date | undefined | React.ChangeEvent<HTMLInputElement>,
    ) => {
      const actualValue =
        value instanceof Event ||
        (typeof value === "object" && value !== null && "target" in value)
          ? (value as React.ChangeEvent<HTMLInputElement>).target.value
          : value;

      updateUserData({ [field]: actualValue });
    };

  const handleBackToInitial = () => {
    onboardState.setVerificationFlow("initial");
    onboardState.setKycStep(1);
  };

  const handleKycNext = () => {
    if (onboardState.kycStep === 1) {
      onboardState.setKycStep(2);
    } else if (onboardState.kycStep === 2) {
      onboardState.setKycStep(3);
    } else if (onboardState.kycStep === 3) {
      onboardState.setKycStep(4);
    } else if (onboardState.kycStep === 4) {
      onboardState.setKycStep("loading");
      setTimeout(() => {
        onboardState.setKycStep("success");
      }, 2000);
    } else if (onboardState.kycStep === "success") {
      onboardState.completeStep("verify");
      onboardState.setCurrentStep("wallet");
      setActualCurrentStep("wallet");

      queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
      queryClient.invalidateQueries({ queryKey: ["kycStatus"] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey.includes("kyc") ||
          query.queryKey.includes("onboarding"),
      });
    }
  };

  const handleKycBack = () => {
    if (onboardState.kycStep === 1) {
      handleBackToInitial();
    } else if (onboardState.kycStep === 2) {
      onboardState.setKycStep(1);
    } else if (onboardState.kycStep === 3) {
      onboardState.setKycStep(2);
    } else if (onboardState.kycStep === 4) {
      onboardState.setKycStep(3);
    }
  };

  const renderStepContent = () => {
    if (actualCurrentStep === "success") {
      return <OnboardSuccess />;
    }

    if (actualCurrentStep === "wallet") {
      return <WalletFirstStep onNext={handleWalletComplete} />;
    }

    if (actualCurrentStep === "verify") {
      if (onboardState.verificationFlow === "kyc") {
        if (onboardState.kycStep === "support-contact") {
          return (
            <KycSupportContact
              formData={{
                firstName: userData.firstName,
                lastName: userData.lastName,
                investmentAmount: parseInt(userData.purchaseAmount),
                verificationType: userData.verificationType as any,
                identityType: "KTP" as any,
                identityNumber: userData.identityNumber || "",
                birthdate: userData.birthdate || new Date(),
                birthplace: userData.birthplace || "",
                address: userData.address || "",
                state: userData.state || "",
                country: userData.selectedCountry || "",
                zipNumber: userData.zipCode || "",
                phoneNumber: userData.phoneNumber || "",
                selectedCountry: userData.selectedCountry || "",
                otherCitizenships: userData.otherCitizenships || "",
                applicantId: userData.applicantId,
              }}
              onBack={handleBackToInitial}
            />
          );
        }
        if (onboardState.kycStep === 1) {
          return <KycStep1 onBack={handleKycBack} onNext={handleKycNext} />;
        }
        if (onboardState.kycStep === 2) {
          return (
            <KycStep2
              otherCitizenships={userData.otherCitizenships}
              selectedCountry={userData.selectedCountry}
              setOtherCitizenships={(value: string) =>
                updateUserData({ otherCitizenships: value })
              }
              setSelectedCountry={(value: string) =>
                updateUserData({ selectedCountry: value })
              }
              onBack={handleKycBack}
              onNext={handleKycNext}
            />
          );
        }
        if (onboardState.kycStep === 3) {
          return (
            <KycStep3
              address={userData.address}
              birthdate={userData.birthdate}
              birthplace={userData.birthplace}
              handleAddressChange={handleInputChange("address")}
              handleBirthdateChange={(date: Date | undefined) =>
                updateUserData({ birthdate: date })
              }
              handleBirthplaceChange={handleInputChange("birthplace")}
              handlePhoneNumberChange={(value: string) =>
                updateUserData({ phoneNumber: value })
              }
              handleStateChange={handleInputChange("state")}
              handleZipCodeChange={handleInputChange("zipCode")}
              phoneNumber={userData.phoneNumber}
              state={userData.state}
              zipCode={userData.zipCode}
              onBack={handleKycBack}
              onNext={handleKycNext}
            />
          );
        }
        if (onboardState.kycStep === 4) {
          return (
            <KycStep4
              onApplicantIdChange={(applicantId: string) =>
                updateUserData({ applicantId })
              }
              onBack={handleKycBack}
              onNext={handleKycNext}
            />
          );
        }
        if (onboardState.kycStep === "loading") {
          return <KycStepLoading />;
        }
        if (onboardState.kycStep === "success") {
          return <KycStepSuccess onNext={handleKycNext} />;
        }
        if (onboardState.kycStep === "failed") {
          return <KycStepFailed />;
        }
      }

      if (onboardState.verificationFlow === "kyb") {
        return (
          <KybStep
            businessAddress={""}
            companyName={""}
            contactPhone={""}
            legalRegistrationType={""}
            registrationNumber={""}
            setBusinessAddress={() => {}}
            setCompanyName={() => {}}
            setContactPhone={() => {}}
            setLegalRegistrationType={() => {}}
            setRegistrationNumber={() => {}}
            setUbo={() => {}}
            ubo={""}
            onBack={handleBackToInitial}
            onSubmit={() => {
              onboardState.completeStep("verify");
              onboardState.setCurrentStep("wallet");
              setActualCurrentStep("wallet");

              queryClient.invalidateQueries({ queryKey: ["onboardingStatus"] });
              queryClient.invalidateQueries({ queryKey: ["kycStatus"] });
              queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey.includes("kyc") ||
                  query.queryKey.includes("kyb") ||
                  query.queryKey.includes("onboarding"),
              });
            }}
          />
        );
      }

      return (
        <VerifyFirstStep
          firstName={userData.firstName}
          handleFirstNameChange={handleInputChange("firstName")}
          handleLastNameChange={handleInputChange("lastName")}
          investorType={userData.investorType}
          lastName={userData.lastName}
          purchaseAmount={userData.purchaseAmount}
          setInvestorType={(type: string) =>
            updateUserData({ investorType: type })
          }
          setPurchaseAmount={(amount: string) => {
            updateUserData({ purchaseAmount: amount });
            if (parseInt(amount) < 1000000) {
              updateUserData({ verificationType: "" });
            }
          }}
          setVerificationType={(type: string) =>
            updateUserData({ verificationType: type })
          }
          verificationType={userData.verificationType || ""}
          onNext={handleInitialVerifyNext}
        />
      );
    }

    return null;
  };

  if (!isReadyToRender) {
    return <OnboardSkeleton />;
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-svh">
      {isMobile && (
        <MobileProgress
          isStepActive={onboardState.isStepActive}
          isStepCompleted={onboardState.isStepCompleted}
          setShowProgress={setShowProgress}
          showProgress={showProgress}
        />
      )}

      <DesktopSidebar
        isStepActive={onboardState.isStepActive}
        isStepCompleted={onboardState.isStepCompleted}
      />

      <div className="bg-white flex-1 w-full lg:w-1/2 rounded-t-3xl lg:rounded-none shadow-xl lg:shadow-none z-20 lg:z-auto min-h-[50vh] lg:min-h-svh lg:overflow-y-auto">
        <button
          className="cursor-pointer absolute top-5 right-5"
          onClick={handleClose}
        >
          <X className="w-7 h-7 text-white md:text-black" />
        </button>
        <div className="flex px-12 xl:px-16 2xl:px-20 items-center justify-center w-full h-full py-8">
          <Suspense fallback={<OnboardSkeleton />}>
            {renderStepContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
