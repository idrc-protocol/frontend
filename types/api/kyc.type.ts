import { z } from "zod";

export const KycSchema = z.object({
  id: z.number().int().positive(),
  identityType: z.string(),
  identityNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthdate: z.date(),
  birthplace: z.string(),
  address: z.string(),
  state: z.string(),
  country: z.string(),
  zipNumber: z.string(),
  phoneNumber: z.string(),
  proofAddressFile: z.string().url(),
  professOfAddress: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number().int().positive(),
  kycStatus: z.string(),
  provider: z.string(),
});

export type Kyc = z.infer<typeof KycSchema>;
