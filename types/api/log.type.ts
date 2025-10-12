import { z } from "zod";

export const LogSchema = z.object({
  id: z.number().int().positive(),
  actions: z.string(),
  timestamp: z.date(),
  message: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  admin_id: z.number().int().positive(),
});

export type Log = z.infer<typeof LogSchema>;
