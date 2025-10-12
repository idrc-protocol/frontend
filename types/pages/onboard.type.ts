export type OnboardStep = "verify" | "wallet" | "success";
export type VerificationFlow = "initial" | "kyc" | "kyb";
export type KycStepType =
  | 1
  | 2
  | 3
  | 4
  | "loading"
  | "failed"
  | "success"
  | "support-contact";
export type IdType = "driver-license" | "national-id" | "passport";

export interface UserData {
  firstName: string;
  lastName: string;
  investorType: string;
  purchaseAmount: string;
  verificationType?: string;
  identityNumber: string;
  phoneNumber: string;
  birthdate: Date | undefined;
  birthplace: string;
  address: string;
  state: string;
  zipCode: string;
  selectedCountry: string;
  otherCitizenships: string;
  applicantId?: string;
}

export interface BusinessData {
  companyName: string;
  registrationNumber: string;
  businessAddress: string;
  contactPhone: string;
  ubo: string;
  legalRegistrationType: string;
}

export interface DocumentData {
  documentFrontFile: File | null;
  documentBackFile: File | null;
  selectedIdType: IdType;
}
