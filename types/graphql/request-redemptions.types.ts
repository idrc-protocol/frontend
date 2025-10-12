import { z } from "zod";

export const RequestRedemptionsSchema = z.object({
  amount: z.string(),
  blockNumber: z.string(),
  blockTimestamp: z.string(),
  id: z.string(),
  shares: z.string(),
  transactionHash: z.string(),
  user: z.string(),
});

export type RequestRedemptionsType = z.infer<typeof RequestRedemptionsSchema>;
