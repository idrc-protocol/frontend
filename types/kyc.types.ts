import { z } from "zod";

/**
 * Enhanced KYC Types and Interfaces
 * Based on idrc-be backend patterns with functional programming approach
 */

export enum IdentityType {
  KTP = "KTP",
  PASSPORT = "PASSPORT",
  DRIVER_LICENSE = "DRIVER_LICENSE",
  SIM = "SIM",
}

export enum KycStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DENIED = "DENIED",
  CANCELED = "CANCELED",
  MANUAL_REVIEW = "MANUAL_REVIEW",
  LOCKED = "LOCKED",
}

export enum KycProvider {
  SUMSUB = "SUMSUB",
  MANUAL = "MANUAL",
}

export enum VerificationType {
  STANDARD = "STANDARD",
  OTC = "OTC",
  INTERNAL = "INTERNAL",
}

export interface KycFormData {
  identityType: IdentityType;
  identityNumber: string;
  firstName: string;
  lastName: string;
  birthdate: Date;
  birthplace: string;

  address: string;
  state: string;
  country: string;
  zipNumber: string;

  phoneNumber: string;

  selectedCountry: string;
  otherCitizenships?: string;

  investmentAmount: number;
  verificationType?: VerificationType;
  applicantId?: string;
}

export interface CreateKycRequest {
  identityType: IdentityType;
  identityNumber: string;
  birthdate: string;
  birthplace: string;
  address: string;
  state: string;
  country: string;
  zipNumber: string;
  phoneNumber: string;
  fileName?: string;
  provider?: KycProvider;
  status?: KycStatus;
  applicantId?: string;
}

export interface KycResponse {
  id: string;
  identityType: IdentityType;
  identityNumber: string;
  birthdate: Date;
  birthplace: string;
  address: string;
  state: string;
  country: string;
  zipNumber: string;
  phoneNumber: string;
  status: KycStatus;
  provider?: string;
  fileName?: string;
  userId: string;
  applicantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KycStatusResponse {
  status: KycStatus;
  message: string;
  updatedAt: Date;
}

export interface SumsubStatus {
  applicantId: string;
  status: "approved" | "rejected" | "pending" | "init";
  reviewStatus: string;
  createdAt: string;
  updatedAt: string;
  extractedData?: {
    identityNumber?: string;
    identityType?: string;
    [key: string]: any;
  };
}

export interface SumsubCallback {
  type: string;
  applicantId: string;
  reviewStatus: string;
  timestamp: string;
  payload?: any;
}

export interface VerificationFlowData {
  formData: KycFormData;
  sumsubData?: SumsubStatus;
  kycResponse?: KycResponse;
  currentStep: number;
  isHighValueInvestor: boolean;
}

export interface ValidationStep {
  id: string;
  label: string;
  status: "pending" | "checking" | "completed" | "failed" | "submitted";
  details?: string;
}

export const KycFormSchema = z.object({
  identityType: z.nativeEnum(IdentityType),
  identityNumber: z
    .string()
    .min(10, "Identity number must be at least 10 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  birthdate: z.date(),
  birthplace: z.string().min(2, "Birthplace must be at least 2 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  zipNumber: z.string().regex(/^\d{5}$/, "Zip code must be 5 digits"),
  phoneNumber: z
    .string()
    .regex(/^\+62\d{8,13}$/, "Must be valid Indonesian phone number"),
  selectedCountry: z.string(),
  otherCitizenships: z.string().optional(),
  investmentAmount: z.number().positive(),
  verificationType: z.nativeEnum(VerificationType).optional(),
  applicantId: z
    .string()
    .min(3, "Applicant ID must be at least 3 characters")
    .max(100, "Applicant ID must not exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Applicant ID can only contain letters, numbers, underscore, and dash",
    )
    .optional(),
});

export interface KycError {
  code: string;
  message: string;
  field?: string;
}

export const KYC_CONSTANTS = {
  HIGH_VALUE_THRESHOLD: 1000000,
  SUMSUB_TOKEN_EXPIRY: 1200,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "application/pdf"],
  MIN_AGE: 17,
  MAX_AGE: 120,
  SUPPORTED_COUNTRIES: ["IDN", "INDONESIA", "ID"],
  SUPPORTED_PROVIDERS: ["MANUAL", "SUMSUB"],
};

export const STATUS_MESSAGES: Record<KycStatus, string> = {
  [KycStatus.PENDING]: "KYC verification is pending review",
  [KycStatus.APPROVED]: "KYC verification has been approved",
  [KycStatus.REJECTED]: "KYC verification has been rejected",
  [KycStatus.DENIED]: "KYC verification has been denied",
  [KycStatus.CANCELED]: "KYC verification has been canceled",
  [KycStatus.MANUAL_REVIEW]: "KYC verification requires manual review",
  [KycStatus.LOCKED]: "KYC verification is locked",
};

export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface UpdateKycStatusRequest {
  status: KycStatus;
}

export interface UpdateKycApplicantIdRequest {
  applicantId: string;
}

export interface SumsubTokenRequest {
  externalUserId: string;
}

export interface SumsubCallbackRequest {
  applicantId: string;
  reviewStatus: string;
  formData: KycFormData;
}

export interface SumsubTokenResponse {
  token: string;
  expiresAt?: Date;
}

export interface SumsubApplicantResponse {
  id: string;
  status: string;
  reviewResult?: {
    reviewAnswer: string;
    rejectLabels?: string[];
    reviewRejectType?: string;
  };
  info?: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    country?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule<T = any> {
  field: keyof T;
  validator: (value: any) => boolean;
  message: string;
}

export interface KycServiceConfig {
  apiBaseUrl: string;
  timeout?: number;
  retries?: number;
  enableMockMode?: boolean;
}

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface KycBusinessRules {
  minAge: number;
  maxAge: number;
  supportedCountries: string[];
  supportedProviders: string[];
  allowedFileExtensions: string[];
  maxFileNameLength: number;
  minAddressLength: number;
  maxAddressLength: number;
}

export interface StatusTransition {
  from: KycStatus;
  to: KycStatus;
}

export interface StatusTransitionMap {
  [key: string]: KycStatus[];
}

export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = ApiError> = Promise<Result<T, E>>;

export interface MockKycOptions {
  status?: KycStatus;
  provider?: KycProvider;
  delay?: number;
}

export interface HttpRequestConfig {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class KycServiceError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, any>,
  ) {
    super(message);
    this.name = "KycServiceError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const isKycStatus = (value: any): value is KycStatus => {
  return Object.values(KycStatus).includes(value);
};

export const isIdentityType = (value: any): value is IdentityType => {
  return Object.values(IdentityType).includes(value);
};

export const isKycProvider = (value: any): value is KycProvider => {
  return Object.values(KycProvider).includes(value);
};

export const isApiError = (value: any): value is ApiError => {
  return (
    typeof value === "object" &&
    typeof value.message === "string" &&
    typeof value.statusCode === "number"
  );
};

export const ERROR_MESSAGES = {
  USER_ID_REQUIRED: "User ID is required",
  USER_ID_INVALID: "User ID must be a valid string",
  USER_ID_EMPTY: "User ID cannot be empty",
  USER_NOT_FOUND: "User not found",
  USER_NOT_ACTIVE: "User account is not active",
  KYC_ALREADY_EXISTS: "User already has KYC data",
  INVALID_BIRTHDATE: "Invalid birthdate",
  BIRTHDATE_FUTURE: "Birthdate cannot be in the future",
  AGE_TOO_YOUNG: "Minimum age requirement is 17 years",
  AGE_TOO_OLD: "Age seems unrealistic",
  INVALID_PHONE: "Invalid phone number format",
  INVALID_ADDRESS: "Address is too short or contains invalid data",
  UNSUPPORTED_COUNTRY: "Country is not currently supported",
  INVALID_ZIP: "Invalid postal code",
  INVALID_FILE: "Invalid file format or size",
  SUMSUB_ERROR: "Sumsub verification failed",
  API_ERROR: "API request failed",
};
