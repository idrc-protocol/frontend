"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import SumsubWebSdk from "@sumsub/websdk-react";
import { toast } from "sonner";

import {
  generateExternalUserId,
  generateSumsubToken,
} from "@/lib/utils/sumsub";
import {
  SumsubWebSDKConfig,
  SumsubWebSDKOptions,
} from "@/types/sumsub/sumsub.type";

import { Button } from "../ui/button";

export default function SumsubKyc() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const externalUserId = generateExternalUserId("kyc");
  const [, setKycStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [, setApplicantId] = useState<string>("");

  const handleTokenExpiration = async () => {
    await generateToken();

    return accessToken;
  };

  const handleMessage = (type: string, payload: any) => {
    switch (type) {
      case "idCheck.onReady":
        setKycStatus("loading");
        break;

      case "idCheck.applicantStatus":
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
        }
        break;

      case "idCheck.onApplicantLoaded":
        setKycStatus("loading");
        if (payload.applicantId) {
          setApplicantId(payload.applicantId);
        }
        break;

      case "idCheck.applicantSubmitted":
        setKycStatus("success");
        toast.success("KYC submitted successfully. Verification in progress.");
        break;

      case "idCheck.onError":
        setKycStatus("error");
        toast.error("KYC error details:", payload);

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

      case "idCheck.onInitializationError":
        toast.error("KYC initialization error:", payload);
        setKycStatus("error");
        setError(
          "Failed to initialize verification. Please refresh the page and try again.",
        );
        break;

      default:
        toast.error(`KYC message: ${type}`, {
          description: JSON.stringify(payload),
        });
    }
  };

  const handleError = (error: any) => {
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

  const generateToken = async () => {
    setLoading(true);
    setError("");

    try {
      const tokenResponse = await generateSumsubToken(
        externalUserId,
        process.env.NEXT_PUBLIC_KYC_LEVEL_NAME,
        1200,
      );

      if (tokenResponse) {
        setAccessToken(tokenResponse.token);
      } else {
        setError("Failed to generate access token. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while initializing KYC. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      generateToken();
    }
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Initializing KYC verification...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-600 text-center mb-4">{error}</p>
          <Button variant="default" onClick={generateToken}>
            Try Again
          </Button>
        </div>
      );
    }

    if (accessToken) {
      return (
        <div className="w-full h-full">
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
        </div>
      );
    }

    return null;
  };

  return renderContent();
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
