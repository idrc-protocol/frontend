import { api } from "@/lib/api";
import {
  CreateKycRequest,
  KycResponse,
  KycStatus,
  KycProvider,
  UpdateKycApplicantIdRequest,
} from "@/types/kyc.types";
import {
  SumsubTokenResponse,
  ReviewStatus,
  KYCStatus,
} from "@/types/sumsub/sumsub.type";
import { generateSumsubToken, getKYCStatus } from "@/lib/utils/sumsub";

export const kycService = {
  initiateKyc: (data: CreateKycRequest): Promise<KycResponse> =>
    api.post("/api/v1/kyc/initiate", data),
  updateApplicantId: (
    data: UpdateKycApplicantIdRequest,
  ): Promise<KycResponse> => api.put("/api/v1/kyc/applicant-id", data),
  getProviders: (): KycProvider[] => [KycProvider.MANUAL, KycProvider.SUMSUB],
  canCreateKyc: (userData?: { status?: string; hasKyc?: boolean }): boolean => {
    if (!userData) return false;

    return userData.status === "ACTIVE" && !userData.hasKyc;
  },
  validateKycData: (data: Partial<CreateKycRequest>) => {
    const errors: Record<string, string> = {};

    if (!data.identityType) {
      errors.identityType = "Identity type is required";
    }

    if (!data.identityNumber || data.identityNumber.trim().length < 10) {
      errors.identityNumber = "Identity number must be at least 10 characters";
    }

    if (!data.birthdate) {
      errors.birthdate = "Birthdate is required";
    } else {
      const birthDate = new Date(data.birthdate);
      const now = new Date();

      if (birthDate >= now) {
        errors.birthdate = "Birthdate cannot be in the future";
      }

      const age = now.getFullYear() - birthDate.getFullYear();

      if (age < 17) {
        errors.birthdate = "Minimum age requirement is 17 years";
      }
    }

    if (!data.address || data.address.trim().length < 10) {
      errors.address = "Address must be at least 10 characters";
    }

    if (!data.phoneNumber || !/^\+62\d{8,13}$/.test(data.phoneNumber)) {
      errors.phoneNumber =
        "Must be a valid Indonesian phone number (+62xxxxxxxxx)";
    }

    const requiredFields = [
      "birthplace",
      "state",
      "country",
      "zipNumber",
    ] as const;

    requiredFields.forEach((field) => {
      if (!data[field] || data[field]!.trim().length === 0) {
        errors[field] =
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (data.applicantId) {
      if (data.applicantId.trim().length < 3) {
        errors.applicantId = "Applicant ID must be at least 3 characters";
      }

      if (data.applicantId.trim().length > 100) {
        errors.applicantId = "Applicant ID must not exceed 100 characters";
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(data.applicantId.trim())) {
        errors.applicantId =
          "Applicant ID can only contain letters, numbers, underscore, and dash";
      }
    }

    if (data.zipNumber && !/^\d{5}$/.test(data.zipNumber)) {
      errors.zipNumber = "Zip code must be exactly 5 digits";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
  validateApplicantId: (
    applicantId: string,
  ): { isValid: boolean; error?: string } => {
    if (!applicantId || typeof applicantId !== "string") {
      return { isValid: false, error: "Applicant ID is required" };
    }

    const trimmed = applicantId.trim();

    if (trimmed.length < 3) {
      return {
        isValid: false,
        error: "Applicant ID must be at least 3 characters",
      };
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: "Applicant ID must not exceed 100 characters",
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return {
        isValid: false,
        error:
          "Applicant ID can only contain letters, numbers, underscore, and dash",
      };
    }

    return { isValid: true };
  },
  getStatusMessage: (status: KycStatus): string => {
    const messages: Record<KycStatus, string> = {
      [KycStatus.PENDING]: "KYC verification is pending review",
      [KycStatus.APPROVED]: "KYC verification has been approved",
      [KycStatus.REJECTED]: "KYC verification has been rejected",
      [KycStatus.DENIED]: "KYC verification has been denied",
      [KycStatus.CANCELED]: "KYC verification has been canceled",
      [KycStatus.MANUAL_REVIEW]: "KYC verification requires manual review",
      [KycStatus.LOCKED]: "KYC verification is locked",
    };

    return messages[status] || "Unknown status";
  },

  sumsub: {
    generateToken: async (
      userId: string,
      levelName?: string,
      ttlInSecs?: number,
    ): Promise<SumsubTokenResponse> => {
      if (!userId || userId.trim().length === 0) {
        throw new Error("User ID is required");
      }

      try {
        const tokenResponse = await generateSumsubToken(
          userId,
          levelName,
          ttlInSecs,
        );

        if (!tokenResponse) {
          throw new Error("Failed to generate SumSub token");
        }

        return tokenResponse;
      } catch (error) {
        throw new Error(
          `SumSub token generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    getApplicantData: async (applicantId: string): Promise<any> => {
      if (!applicantId || applicantId.trim().length === 0) {
        throw new Error("Applicant ID is required");
      }

      try {
        const applicantData = await getKYCStatus(applicantId);

        const reviewStatus =
          applicantData.reviewStatus || applicantData.status || "init";

        return {
          applicantId: applicantData.applicantId,
          externalUserId: applicantData.externalUserId,
          reviewStatus: reviewStatus,
          levelName: applicantData.levelName || "basic-kyc-level",
          createdAt: applicantData.createdAt,
          attemptCount: applicantData.attemptCount || 0,
          isReprocessing: applicantData.isReprocessing || false,
          requiredDocuments: applicantData.requiredDocuments || [],
          extractedData: applicantData.extractedData || {},
          status: kycService.sumsub.mapSumsubStatusToKycStatus(reviewStatus),
          info: applicantData.info || {},
          documents: applicantData.documents || [],
          idDocs: applicantData.info?.idDocs || [],
        };
      } catch (error) {
        throw new Error(
          `Failed to get applicant data: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    getKycStatus: async (applicantId: string): Promise<KYCStatus> => {
      try {
        const applicantData =
          await kycService.sumsub.getApplicantData(applicantId);

        return {
          status: applicantData.status,
          applicantId: applicantData.applicantId,
          reviewId: applicantData.reviewId,
          lastUpdated: applicantData.createdAt,
          rejectionReason: applicantData.rejectionReason,
        };
      } catch (error) {
        throw new Error(
          `Failed to get KYC status: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },
    generateExternalUserId: (prefix: string = "user"): string => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);

      return `${prefix}-${timestamp}-${random}`;
    },
    mapSumsubStatusToKycStatus: (
      reviewStatus: ReviewStatus,
    ): KYCStatus["status"] => {
      const statusMap: Record<ReviewStatus, KYCStatus["status"]> = {
        init: "not_started",
        pending: "pending",
        prechecked: "in_progress",
        queued: "in_progress",
        completed: "approved",
        onHold: "on_hold",
      };

      return statusMap[reviewStatus] || "not_started";
    },
    validateConfiguration: (): {
      isValid: boolean;
      errors: string[];
    } => {
      const errors: string[] = [];

      if (!process.env.SUMSUB_APP_TOKEN) {
        errors.push("SUMSUB_APP_TOKEN environment variable is missing");
      }

      if (!process.env.SUMSUB_SECRET_KEY) {
        errors.push("SUMSUB_SECRET_KEY environment variable is missing");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    getReviewStatusMessage: (reviewStatus: ReviewStatus): string => {
      const messages: Record<ReviewStatus, string> = {
        init: "KYC verification not started",
        pending: "KYC verification is being reviewed",
        prechecked: "KYC documents are being processed",
        queued: "KYC verification is queued for review",
        completed: "KYC verification completed successfully",
        onHold: "KYC verification is on hold - additional information required",
      };

      return messages[reviewStatus] || "Unknown status";
    },
    canSubmitNewDocuments: async (applicantId: string): Promise<boolean> => {
      try {
        const applicantData =
          await kycService.sumsub.getApplicantData(applicantId);

        return (
          applicantData.reviewStatus !== "completed" ||
          applicantData.isReprocessing
        );
      } catch {
        return true;
      }
    },
    extractDataFromSumsub: (
      applicantData: any,
    ): {
      identityNumber?: string;
      fileName?: string;
      firstName?: string;
      lastName?: string;
      birthdate?: string;
      [key: string]: any;
    } => {
      const extractedData = applicantData.extractedData || {};
      const info = applicantData.info || {};
      const documents = applicantData.documents || [];
      const idDocs = info.idDocs || [];

      const primaryIdDoc = idDocs.length > 0 ? idDocs[0] : {};

      const identityNumber =
        extractedData.identityNumber ||
        extractedData.idNumber ||
        extractedData.documentNumber ||
        primaryIdDoc.number ||
        info.idDocNumber ||
        info.idNumber;
      const fileName =
        documents.length > 0
          ? documents[0].fileName || documents[0].originalName
          : null;

      const firstName =
        extractedData.firstName || primaryIdDoc.firstName || info.firstName;
      const lastName =
        extractedData.lastName || primaryIdDoc.lastName || info.lastName;
      const birthdate = extractedData.dob || primaryIdDoc.dob || info.dob;
      const address = extractedData.address || info.address;

      const result = {
        identityNumber,
        fileName,
        firstName,
        lastName,
        birthdate,
        address,

        documentType: primaryIdDoc.idDocType,
        country: primaryIdDoc.country || info.country,

        _debug: {
          hasExtractedData: Object.keys(extractedData).length > 0,
          hasInfo: Object.keys(info).length > 0,
          hasIdDocs: idDocs.length > 0,
          hasPrimaryIdDoc: Object.keys(primaryIdDoc).length > 0,
          dataSourcesUsed: {
            identityNumber: identityNumber ? "found" : "missing",
            firstName: firstName ? "found" : "missing",
            lastName: lastName ? "found" : "missing",
            birthdate: birthdate ? "found" : "missing",
          },
        },
        ...extractedData,
      };

      return result;
    },
    validateKycDataWithSumsub: (
      kycData: any,
      sumsubData: any,
    ): {
      isValid: boolean;
      errors: Array<{
        field: string;
        expectedValue: string;
        actualValue: string;
        message: string;
      }>;
    } => {
      const errors: Array<{
        field: string;
        expectedValue: string;
        actualValue: string;
        message: string;
      }> = [];

      const extractedData = kycService.sumsub.extractDataFromSumsub(sumsubData);

      if (extractedData.identityNumber && kycData.identityNumber) {
        const normalizeId = (id: string) =>
          id.replace(/[\s-]/g, "").toLowerCase();

        if (
          normalizeId(extractedData.identityNumber) !==
          normalizeId(kycData.identityNumber)
        ) {
          errors.push({
            field: "identityNumber",
            expectedValue: kycData.identityNumber,
            actualValue: extractedData.identityNumber,
            message:
              "Identity number from document does not match the provided information",
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    checkKycStatusAndRedirect: async (
      applicantId: string,
      kycFormData?: any,
    ): Promise<{
      shouldRedirect: boolean;
      redirectTo: "loading" | "success" | "failed";
      validationErrors?: Array<{
        field: string;
        expectedValue: string;
        actualValue: string;
        message: string;
      }>;
      extractedData?: any;
    }> => {
      try {
        const applicantData =
          await kycService.sumsub.getApplicantData(applicantId);

        const extractedData =
          kycService.sumsub.extractDataFromSumsub(applicantData);

        const hasExtractedData =
          extractedData &&
          (extractedData.identityNumber ||
            extractedData.firstName ||
            extractedData.lastName ||
            extractedData.birthdate);

        if (kycFormData && hasExtractedData) {
          const validation = kycService.sumsub.validateKycDataWithSumsub(
            kycFormData,
            applicantData,
          );

          if (!validation.isValid) {
            return {
              shouldRedirect: true,
              redirectTo: "failed",
              validationErrors: validation.errors,
              extractedData,
            };
          }
        }

        switch (applicantData.reviewStatus) {
          case "completed":
            return {
              shouldRedirect: true,
              redirectTo: "success",
              extractedData,
            };

          case "pending":
          case "queued":
          case "prechecked":
            return {
              shouldRedirect: true,
              redirectTo: "loading",
              extractedData,
            };

          case "onHold":
            return {
              shouldRedirect: true,
              redirectTo: "failed",
              extractedData,
            };

          case "init":
            return {
              shouldRedirect: false,
              redirectTo: "success",
              extractedData,
            };

          default:
            return {
              shouldRedirect: true,
              redirectTo: "success",
              extractedData,
            };
        }
      } catch {
        return {
          shouldRedirect: false,
          redirectTo: "success",
          extractedData: {},
        };
      }
    },

    isStatusApproved: (reviewStatus: string): boolean => {
      const approvedStatuses = ["completed", "approved"];

      return approvedStatuses.includes(reviewStatus);
    },

    isStatusInProgress: (reviewStatus: string): boolean => {
      const progressStatuses = ["pending", "queued", "prechecked"];

      return progressStatuses.includes(reviewStatus);
    },

    isStatusFailed: (reviewStatus: string): boolean => {
      const failedStatuses = ["onHold", "rejected", "denied"];

      return failedStatuses.includes(reviewStatus);
    },
  },
};
