"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import Loading from "@/components/loader/loading";
import { useUserData } from "@/hooks/pages/onboard/use-user-data";
import { useOnboardState } from "@/hooks/pages/onboard/use-onboard-state";
import { UserData } from "@/types/pages/onboard.type";
import { useMobile } from "@/hooks/window/useMobile";

import WalletFirstStep from "./wallet-step/wallet-first-step";
import VerifyFirstStep from "./verify-step/verify-first-step";
import { DesktopSidebar } from "./onboard-desktop-sidebar";
import { MobileProgress } from "./onboard-mobile-progress";
import OnboardSuccess from "./onboard-success";

export default function Onboard() {
  const router = useRouter();
  const { isMobile } = useMobile();
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

  const renderStepContent = () => {
    if (actualCurrentStep === "success") {
      return <OnboardSuccess />;
    }

    if (actualCurrentStep === "wallet") {
      return <WalletFirstStep onNext={handleWalletComplete} />;
    }

    if (actualCurrentStep === "verify") {
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
    return <Loading />;
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
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

      <div className="bg-white flex-1 w-full lg:w-1/2 rounded-t-3xl lg:rounded-none shadow-xl lg:shadow-none z-20 lg:z-auto min-h-[50vh] lg:min-h-screen lg:overflow-y-auto">
        <button
          className="cursor-pointer absolute top-5 right-5"
          onClick={handleClose}
        >
          <X className="w-7 h-7 text-white md:text-black" />
        </button>
        <div className="flex px-12 xl:px-16 2xl:px-20 items-center justify-center w-full h-full py-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center w-full h-full">
                <Loading />
              </div>
            }
          >
            {renderStepContent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
