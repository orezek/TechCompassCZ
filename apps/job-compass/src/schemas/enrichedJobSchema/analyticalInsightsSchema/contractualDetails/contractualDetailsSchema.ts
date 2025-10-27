import { z } from "zod";

const INGESTION_DATE_CONTEXT = "2025-10-21T00:00:00Z";

// =================================================================
// 5. Contractual Details
// =================================================================

// Enum Definitions
const EmploymentTypeEnum = z.enum([
  "Full-time",
  "Part-time",
  "Internship/Trainee",
]);

const ContractTypeEnum = z.enum([
  "HPP (Employee Contract)",
  "IČO (Freelance/Self-Employed)",
  "DPP/DPČ (Part-time Agreements)",
  "Other",
]);

const ContractDurationEnum = z.enum([
  "Permanent (Indefinite)",
  "Temporary (Fixed-term)",
  "Project-based",
]);

const HiringUrgencyEnum = z.enum(["Immediate", "Standard", "Future Pipeline"]);

// Schema Definition
export const contractualDetailsSchema = z.object({
  employmentType: EmploymentTypeEnum.nullable()
    .default(null)
    .describe(
      "Definition: The working hours arrangement. Inference Guide: 'Full-time' ('plný úvazek'). 'Part-time' ('zkrácený úvazek') is indicated by specific hours or fractions (e.g., '0,6 úvazek').",
    ),

  contractType: ContractTypeEnum.nullable()
    .default(null)
    .describe(
      "Definition: The legal basis of the employment relationship. Inference Guide: 'pracovní smlouva' maps to 'HPP'. 'IČO' or 'živnostenský list' maps to 'IČO'. 'DPČ' or 'DPP' map to 'DPP/DPČ'.",
    ),

  contractDuration: ContractDurationEnum.nullable()
    .default(null)
    .describe(
      "Definition: The duration of the contract. Inference Guide: 'Na dobu neurčitou' (Indefinite time) maps to 'Permanent'. 'Na dobu určitou' (Fixed time) maps to 'Temporary'.",
    ),

  // Using z.string().datetime() ensures ISO 8601 format validation
  startDateEarliest: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .default(null)
    .describe(
      `Definition: The earliest normalized start date (ISO 8601 DateTime with timezone). Inference Guide: Normalize text mentions. 'Immediate' ('ihned') or 'By agreement' ('dle dohody') should default to the current ingestion date (e.g., ${INGESTION_DATE_CONTEXT}). If a specific future date or month is provided (e.g., 'říjen 2025'), use the first day of that period.`,
    ),

  startDateFlexible: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the start date is negotiable. Inference Guide: Set to TRUE if 'By agreement' ('dle dohody') is mentioned. Default to FALSE if a firm date is given or only 'Immediate' is mentioned.",
    ),

  hiringUrgency: HiringUrgencyEnum.nullable()
    .default(null)
    .describe(
      "Definition: How quickly the company wants to fill the position. Inference Guide: 'Immediate' if 'Nástup možný ihned' (Start immediately) is mentioned. Otherwise, infer 'Standard'.",
    ),
});
