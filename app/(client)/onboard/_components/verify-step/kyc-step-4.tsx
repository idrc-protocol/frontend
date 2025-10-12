import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import SumsubWebSdk from "@sumsub/websdk-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { kycService } from "@/services/kyc.service";
import {
  SumsubWebSDKConfig,
  SumsubWebSDKOptions,
} from "@/types/sumsub/sumsub.type";

export default function KycStep4({
  onNext,
  onBack,
  onApplicantIdChange,
}: {
  onNext?: () => void;
  onBack?: () => void;
  onApplicantIdChange?: (applicantId: string) => void;
}) {
  const [accessToken, setAccessToken] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [applicantId, setApplicantId] = React.useState<string>("");
  const [hasRedirected, setHasRedirected] = React.useState<boolean>(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const generateToken = async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError("");

    try {
      const externalUserId =
        await kycService.sumsub.generateExternalUserId("kyc");

      const token = await kycService.sumsub.generateToken(externalUserId);

      if (token && isMountedRef.current) {
        setAccessToken(token.token);
      } else if (isMountedRef.current) {
        setError("Failed to generate access token. Please try again.");
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError("An error occurred while initializing KYC. Please try again.");
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleTokenExpiration = async () => {
    await generateToken();

    return accessToken;
  };

  const handleRedirection = (applicantId?: string) => {
    if (hasRedirected || !isMountedRef.current) return;

    setHasRedirected(true);

    if (applicantId) {
      localStorage.setItem("sumsubApplicantId", applicantId);
    }

    setTimeout(() => {
      if (isMountedRef.current && onNext) {
        onNext();
      }
    }, 2000);
  };

  const isCompletedStatus = (payload: any) => {
    return (
      payload.reviewStatus === "completed" ||
      payload.status === "approved" ||
      payload.reviewStatus === "reviewCompleted" ||
      payload.status === "final" ||
      payload.status === "completed"
    );
  };

  const checkApplicantStatusAndRedirect = async (applicantId: string) => {
    try {
      const statusCheck =
        await kycService.sumsub.checkKycStatusAndRedirect(applicantId);

      if (statusCheck.shouldRedirect && statusCheck.redirectTo === "success") {
        toast.success("Verification already completed!");
        handleRedirection(applicantId);
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (applicantId) {
      checkApplicantStatusAndRedirect(applicantId);
    }
  }, [applicantId]);

  const handleMessage = (type: string, payload: any) => {
    if (!isMountedRef.current || hasRedirected) return;

    switch (type) {
      case "idCheck.onReady":
        break;

      case "idCheck.applicantStatus":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
          onApplicantIdChange?.(payload.applicantId);

          if (isCompletedStatus(payload)) {
            toast.success("Verification already completed!");
            handleRedirection(payload.applicantId);
          }
        }
        break;

      case "idCheck.onApplicantLoaded":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
          onApplicantIdChange?.(payload.applicantId);

          if (isCompletedStatus(payload)) {
            toast.success("Verification already completed!");
            handleRedirection(payload.applicantId);
          }
        }
        break;

      case "idCheck.applicantSubmitted":
      case "idCheck.onApplicantSubmitted":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
          onApplicantIdChange?.(payload.applicantId);
        }
        toast.success("KYC submitted successfully. Verification in progress.");

        break;

      case "idCheck.reviewCompleted":
      case "idCheck.onApplicantVerificationCompleted":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
        }
        toast.success("Verification completed successfully!");
        handleRedirection(payload.applicantId);
        break;

      case "idCheck.stepCompleted":
      case "idCheck.onStepCompleted":
        if (payload.isFinal || isCompletedStatus(payload)) {
          toast.success("Verification completed!");
          if (payload.applicantId) {
            setApplicantId(payload.applicantId);
            localStorage.setItem("sumsubApplicantId", payload.applicantId);
          }
          handleRedirection(payload.applicantId);
        }
        break;

      case "idCheck.onStepChange":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
        }
        break;

      case "idCheck.actionCompleted":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
        }

        break;

      case "idCheck.videoIdentCompleted":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);
        }
        toast.success("Video verification completed!");
        handleRedirection(payload.applicantId);
        break;

      case "idCheck.onApplicantStatusChanged":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
          localStorage.setItem("sumsubApplicantId", payload.applicantId);

          if (isCompletedStatus(payload)) {
            toast.success("Verification completed!");
            handleRedirection(payload.applicantId);
          }
        }
        break;

      case "idCheck.onError":
        if (payload.code === "initialization-error") {
          setError(
            "Failed to initialize KYC verification. Please check your network connection and try again.",
          );
        } else {
          setError(
            payload.message || "An error occurred during KYC verification",
          );
        }
        break;

      default:
        break;
    }
  };

  const handleError = (error: any) => {
    if (!isMountedRef.current) return;

    if (error.code === "initialization-error") {
      if (error.error && error.error.includes("post message init")) {
        setError(
          "Network timeout during initialization. Please check your internet connection and try again.",
        );
      } else {
        setError("Failed to initialize KYC verification. Please try again.");
      }
    } else {
      setError(error.message || "An error occurred during KYC verification");
    }
  };

  useEffect(() => {
    if (!accessToken && !localStorage.getItem("sumsubApplicantId")) {
      generateToken();
    } else if (localStorage.getItem("sumsubApplicantId")) {
      setApplicantId(localStorage.getItem("sumsubApplicantId") || "");
    }
  }, []);

  useEffect(() => {
    setHasRedirected(false);
  }, [accessToken]);

  if (hasRedirected && applicantId && isMountedRef.current) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-md items-center justify-center py-12">
        <CheckCircle2 className="text-green-600" size={64} />
        <h2 className="text-xl font-semibold text-center text-black">
          Verification Already Completed
        </h2>
        <p className="text-sm text-gray-600 text-center max-w-sm">
          Your identity has been successfully verified. You will be redirected
          shortly.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Loader2 className="animate-spin text-gray-500" size={20} />
          <span className="text-sm text-gray-500">Redirecting...</span>
        </div>
      </div>
    );
  }

  if (loading || !isMountedRef.current) {
    return (
      <div className="flex flex-col gap-5 w-full max-w-md justify-center items-center">
        <Loader2 className="animate-spin mx-auto" size={24} />
        <p className="text-sm">Please wait while we set things up for you.</p>
      </div>
    );
  }

  if (error && isMountedRef.current) {
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
            Document Verification
          </span>

          <div className="flex flex-col gap-5">
            <p className="text-sm">{error}</p>
            <Button
              className="bg-purple-700 text-white hover:bg-purple-700/90 h-14"
              onClick={() => {
                setHasRedirected(false);
                generateToken();
              }}
            >
              Retry
            </Button>
          </div>
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
          Document Verification
        </span>

        <div className="flex flex-col gap-5">
          <p className="text-sm">
            To comply with regulations, we need to verify your identity. This
            process is quick and secure.
          </p>
        </div>

        {!hasRedirected && (
          <SumsubWebSdk
            accessToken={accessToken}
            config={config}
            expirationHandler={handleTokenExpiration}
            options={options}
            onError={handleError}
            onMessage={(type: string, payload: any) =>
              handleMessage(type, payload)
            }
          />
        )}

        {hasRedirected && (
          <div className="flex flex-col gap-3 items-center py-8">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-sm text-gray-600">Redirecting...</p>
          </div>
        )}
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

const config: SumsubWebSDKConfig = {
  lang: "en",
  theme: "light",
  uiConf: {
    customCssStr: `
      .sumsub-wrapper {
        font-family: inherit;
        height: 100% !important;
        min-height: 600px;
        overflow: visible !important;
      }
      .sumsub-container {
        height: auto !important;
        min-height: 600px !important;
        overflow: visible !important;
      }
      .sumsub-iframe {
        height: auto !important;
        min-height: 600px !important;
        width: 100% !important;
        border: none;
        overflow: visible !important;
      }
      body {
        overflow: auto !important;
      }
    `,
  },
  apiTimeout: 30000,
  loadTimeout: 45000,
};

const options: SumsubWebSDKOptions = {
  addViewportTag: false,
  adaptIframeHeight: true,
};
