import { z } from "zod";

export const testSchema = z.object({
  adInfo: z.string().nullable(),
  adAnalysis: z.string().nullable(),
});

export type TestSchema = z.infer<typeof testSchema>;
