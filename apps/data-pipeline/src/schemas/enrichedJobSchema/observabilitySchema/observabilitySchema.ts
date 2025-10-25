import { z } from "zod";
import { benefitsAndPerksSchema } from "../analyticalInsightsSchema/benefitsAndPerks/benefitsAndPerksSchema.js";
import { careerDevelopmentAndRecruitmentInsightsSchema } from "../analyticalInsightsSchema/careerDevelopmentAndRecruitmentInsights/careerDevelopmentAndRecruitmentInsightsSchema.js";
// 1. The schema for a single enrichment module (e.g., the Benefits Parser)
const enrichmentStepSchema = z.object({
  status: z
    .enum(["pending", "success", "error", "human_verified"])
    .default("pending"),
  enrichmentDate: z.date().nullable().default(null),
  llmModelUsed: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "The specific LLM model version used (e.g., 'gpt-4o-2025-05-13').",
    ),
  schemaVersion: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "The version identifier of the target sub-schema when enrichment occurred.",
    ),
  errorMessage: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "Error message if the status is 'error' (e.g., LLM timeout, Zod validation failure).",
    ),
});

// 2. The master metadata schema for the entire document
export const pipelineMetadataSchema = z.object({
  // An overall status for quick querying
  overallEnrichmentStatus: z
    .enum(["staged", "partially_enriched", "fully_enriched", "verified"])
    .default("staged"),
  // analytical insights
  benefitsAndPerks: enrichmentStepSchema,
  careerDevelopmentAndRecruitmentInsights: enrichmentStepSchema,
  companyAndTeamContext: enrichmentStepSchema,
  compensationAndFinancials: enrichmentStepSchema,
  contractualDetails: enrichmentStepSchema,
  corePositionDetails: enrichmentStepSchema,
  culturalAndPsychologicalIndicators: enrichmentStepSchema,
  locationAndWorkModel: enrichmentStepSchema,
  qualificationAndExperience: enrichmentStepSchema,
  technicalSkillsAndMethodologies: enrichmentStepSchema,
  workloadAndEnvironmentContext: enrichmentStepSchema,
});
