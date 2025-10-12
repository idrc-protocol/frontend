import { z } from "zod";

export const KybSchema = z.object({
  id: z.number().int().positive(),
  nama_perusahaan: z.string().optional(),
  address: z.string().optional(),
  ubo: z.string().optional(),
  contactInformation: z.string().optional(),
  legalRegistration: z.string().optional(),
  registrationNumber: z.string().optional(),
  kybStatus: z.string().optional(),
  userId: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  provider: z.string().optional(),
});
export type Kyb = z.infer<typeof KybSchema>;
