import { z } from "zod";

// =================================================================
// 8. Company and Team Context
// =================================================================

// Enum Definitions
const CompanyTypeEnum = z.enum([
  "Product Company (B2B)",
  "Product Company (B2C)",
  "Agency (Recruitment/Staffing)",
  "Outsourcing/BPO",
  "Consultancy/System Integrator",
  "Non-profit/NGO",
  "Government/Public Sector",
  "Startup (Early Stage)",
  "Scale-up (Growth Stage)",
  "Corporate/Enterprise",
]);

const CompanySizeEnum = z.enum([
  "Startup (1-50)",
  "SME (51-250)",
  "Large (251-1000)",
  "Enterprise (1000+)",
]);

const TeamSizeEnum = z.enum(["Small (1-10)", "Medium (11-30)", "Large (30+)"]);

// Schema Definition
export const companyAndTeamContextSchema = z.object({
  companyType: CompanyTypeEnum.nullable()
    .default(null)
    .describe(
      "Definition: The business model of the organization. Inference Guide: Analyze the company description and legal structure. CRITICAL: NORMALIZE the inference to the closest matching Enum value. E.g., 'System Integrator' (like Soitron) -> 'Consultancy/System Integrator'. 'Non-profit' if 'o.p.s.'. 'Government/Public Sector' if 's.p.' (státní podnik) or Ministry. Distinguish based on product focus (B2B/B2C) and growth stage (Startup/Scale-up/Corporate).",
    ),

  companySize: CompanySizeEnum.nullable()
    .default(null)
    .describe(
      "Definition: The approximate size of the company by employee count. Inference Guide: Infer from the company description (e.g., 'global leader' implies Enterprise; '800 mezinárodních odborníků' (Soitron) -> Large (251-1000)). If information is insufficient, return null.",
    ),

  teamSize: TeamSizeEnum.nullable()
    .default(null)
    .describe(
      "Definition: The approximate size of the immediate team. Inference Guide: Inferred from explicit mentions (e.g., 'Do našeho malého týmu' (To our small team) -> Small; 'cca. 5ti-členného' -> Small). If information is insufficient, return null.",
    ),

  isAgencyPosting: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the ad is posted by a recruitment agency. Inference Guide: Set to TRUE if the posting company identifies itself as a 'Recruitment Agency', 'Personální agentura', or explicitly states they are hiring 'for a client'. Default to FALSE.",
    ),
});
