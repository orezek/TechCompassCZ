import { z } from "zod";

// =================================================================
// 11. Career Development and Recruitment Insights (Inferred)
// =================================================================

// Enum Definitions
const RoleGenesisEnum = z.enum([
  "New Position (Growth/Strategy)",
  "Backfill (Replacement)",
  "Temporary Coverage",
]);

const OnboardingStructureEnum = z.enum([
  "Comprehensive/Structured Program",
  "Mentorship/Shadowing",
  "Self-Directed/Minimal Support",
]);

const CareerTrajectoryTypeEnum = z.enum([
  "Technical Leadership/Specialization",
  "People Management",
  "Project/Product Management",
  "Strategic/Advisory",
]);

const RequirementFlexibilityEnum = z.enum([
  "Strict (Must meet all criteria)",
  "Standard (Some flexibility)",
  "Flexible (Willing to train/Focus on potential)",
]);

// Using an Enum for the elements of the hiringProcessDetails array for better validation
const HiringProcessDetailsEnum = z.enum([
  "Technical Test/Homework",
  "Multi-stage Interviews",
  "In-person Meeting Required",
  "Security Clearance/Background Check Required",
  "Urgent Hiring",
]);

// Schema Definition
export const CareerDevelopmentAndRecruitmentInsightsSchema = z.object({
  roleGenesis: RoleGenesisEnum.nullable()
    .default(null)
    .describe(
      "Definition: Indicates whether the position is newly created due to expansion, a replacement for a previous employee, or temporary coverage. Inference Guide (Recruiter View): Inferred from the context. 'Jedná se o nově vzniklou klíčovou roli' (This is a newly created key role) or 'Zvětšujeme se' (We are expanding) indicates 'New Position'. 'zástup za kolegyni odcházející na mateřskou dovolenou' (maternity leave cover) explicitly states 'Temporary Coverage'. If unspecified, it is usually inferred as 'Backfill'.",
    ),
  onboardingStructure: OnboardingStructureEnum.nullable()
    .default(null)
    .describe(
      "Definition: The level of structured training and support provided during the initial phase of employment. Inference Guide (Recruiter View): Inferred from descriptions of the initial period. 'kompletní zaškolení' (complete training) or specific programs (e.g., 'MIT training program') suggests 'Comprehensive/Structured Program'. 'Práce po boku zkušeného seniora' (Working alongside an experienced senior) indicates 'Mentorship/Shadowing'. Senior strategic roles often imply 'Self-Directed'.",
    ),
  careerTrajectoryType: CareerTrajectoryTypeEnum.nullable()
    .default(null)
    .describe(
      "Definition: The most likely path for advancement or specialization from this role. Inference Guide (Recruiter View): Inferred from the role description and mentioned growth opportunities. Explicit mentions of growth into 'vedení projektů' (project management) indicate 'Project/Product Management'. A 'Team Lead' role is on the 'People Management' track. Senior developer roles focused on complex technical challenges suggest 'Technical Leadership/Specialization'.",
    ),
  requirementFlexibility: RequirementFlexibilityEnum.nullable()
    .default(null)
    .describe(
      "Definition: Assesses how strictly the company adheres to its stated requirements versus willingness to train candidates who don't meet all criteria. Inference Guide (Recruiter/Psychologist View): Inferred from the rigidity of the language in the requirements section. Phrases like 'Co musíš 100% splňovat !' (What you must 100% meet) or '= přes to nejede vlak' (non-negotiable) indicate 'Strict'. Junior roles or phrases like 'Zaškolíme absolventy' (We will train graduates) or 'rádi vás zaučíme' (we will gladly train you) indicate 'Flexible'.",
    ),
  hiringProcessDetails: z
    .array(HiringProcessDetailsEnum)
    .default([])
    .describe(
      "Definition: Specific details mentioned or inferred about the interview process stages or requirements. Inference Guide (Recruiter View): Inferred from direct mentions of the process or urgency. Explicit mention of 'domácí úkol' (homework) maps to 'Technical Test/Homework'. 'Nástup možný ihned' (Start immediately) maps to 'Urgent Hiring'. Roles requiring specific legal procedures (e.g., BIS, 'přijímacího řízení podle zákona č.361/2003 Sb.') map to 'Security Clearance/Background Check Required'.",
    ),
});
