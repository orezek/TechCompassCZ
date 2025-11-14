import { loadEnv } from "@repo/env-config";
import { z } from "zod";

export const envSchema = z.object({
  GOOGLE_API_KEY: z.string().describe("Google AI Studio API")
})

export type EnvSchema = z.infer<typeof envSchema>;

const jobCompassSrvEnv = loadEnv(envSchema, import.meta.url);


console.log(jobCompassSrvEnv.GOOGLE_API_KEY);