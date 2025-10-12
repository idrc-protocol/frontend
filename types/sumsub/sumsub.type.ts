export interface SumsubConfig {
  appToken: string;
  secretKey: string;
  baseUrl: string;
  levelName: string;
  ttlInSecs: number;
}

export interface SumsubTokenResponse {
  token: string;
  userId: string;
  expiresIn: number;
}

export interface SumsubApplicantResponse {
  id: string;
  createdAt: string;
  clientId: string;
  inspectionId: string;
  externalUserId: string;
  info: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
  email: string;
  phone: string;
  requiredIdDocs: RequiredIdDoc[];
  review: {
    reviewId: string;
    attemptId: string;
    attemptCnt: number;
    elapsedSincePendingMs: number;
    elapsedSinceQueuedMs: number;
    reprocessing: boolean;
    levelName: string;
    createDate: string;
    reviewStatus: ReviewStatus;
    priority: number;
  };
  lang: string;
}

export interface RequiredIdDoc {
  idDocType: string;
  country: string;
  includedCountries?: string[];
  excludedCountries?: string[];
}

export type ReviewStatus =
  | "init"
  | "pending"
  | "prechecked"
  | "queued"
  | "completed"
  | "onHold";

export interface SumsubWebhookPayload {
  applicantId: string;
  inspectionId: string;
  correlationId: string;
  levelName: string;
  externalUserId: string;
  type: WebhookType;
  reviewStatus: ReviewStatus;
  createdAt: string;
  sandboxMode: boolean;
}

export type WebhookType =
  | "applicantReviewed"
  | "applicantCreated"
  | "applicantDeleted"
  | "applicantPending"
  | "applicantOnHold";

export interface KYCStatus {
  status:
    | "not_started"
    | "in_progress"
    | "pending"
    | "approved"
    | "rejected"
    | "on_hold";
  applicantId?: string;
  reviewId?: string;
  lastUpdated: string;
  rejectionReason?: string;
}

export interface SumsubWebSDKConfig {
  lang?: string;
  theme?: "light" | "dark";
  debug?: boolean;
  uiConf?: {
    customCssStr?: string;
    customCss?: string;
  };
  onboardingLimits?: {
    idDocType?: string[];
    country?: string[];
  };
  metadata?: Record<string, any>;
  apiTimeout?: number;
  loadTimeout?: number;
}

export interface SumsubWebSDKOptions {
  addViewportTag?: boolean;
  adaptIframeHeight?: boolean;
  onInitialized?: () => void;
}

export interface SumsubMessageTypes {
  idCheck?: {
    applicantId: string;
    success: boolean;
  };
  applicantStatus?: {
    applicantId: string;
    reviewStatus: ReviewStatus;
  };
}

export interface CreateApplicantRequest {
  externalUserId: string;
  levelName?: string;
  metadata?: Record<string, any>;
}

export interface TokenGenerationRequest {
  userId: string;
  levelName?: string;
  ttlInSecs?: number;
}
