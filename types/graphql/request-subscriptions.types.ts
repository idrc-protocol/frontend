import { z } from "zod";

export const RequestSubscriptionSchema = z.object({
  amount: z.string(),
  blockNumber: z.string(),
  blockTimestamp: z.string(),
  id: z.string(),
  shares: z.string(),
  transactionHash: z.string(),
  user: z.string(),
});

export type RequestSubscriptionType = z.infer<typeof RequestSubscriptionSchema>;
