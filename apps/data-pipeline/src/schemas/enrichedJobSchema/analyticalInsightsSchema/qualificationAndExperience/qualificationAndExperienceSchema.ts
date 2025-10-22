import { z } from "zod";

// =================================================================
// 7. Qualifications and Experience
// =================================================================

// Enum Definitions
const EducationLevelEnum = z.enum([
  "High School/Secondary", // Středoškolské s maturitou
  "Vocational Training", // Odborné vyučení
  "Bachelor's Degree", // Bakalářské
  "Master's Degree", // Vysokoškolské / univerzitní (Magisterské)
  "Doctorate (PhD)",
]);

const LanguageProficiencyEnum = z.enum([
  "Basic/A1-A2",
  "Intermediate/B1",
  "Upper-Intermediate/B2",
  "Advanced/C1",
  "Proficient/C2",
  "Native/Excellent",
]);

// Sub-schema for Languages
const LanguageRequirementSchema = z.object({
  language: z
    .string()
    .describe("The specific language (e.g., English, German, Czech, Dutch)."),
  proficiency: LanguageProficiencyEnum.describe(
    "The required proficiency level. Normalize terms: (Základní -> Basic/A1-A2), (Mírně pokročilá -> Intermediate/B1), (Středně pokročilá -> Upper-Intermediate/B2), (Pokročilá/Fluent -> Advanced/C1 or Proficient/C2), (Výborná/Rodilý mluvčí -> Native/Excellent).",
  ),
});

// Schema Definition
export const qualificationsAndExperienceSchema = z.object({
  requiredYearsOfExperience: z
    .number()
    .int()
    .nullable()
    .default(null)
    .describe(
      "Definition: The minimum years of relevant professional experience required. Inference Guide: Extract from explicit statements (e.g., 'Minimálně praxi 2 roky'). If not explicit, infer based on the Seniority Level (e.g., Graduate=0, Junior=1-2, Mid=3-5, Senior=5+). If impossible to determine, return null.",
    ),

  educationLevelRequired: EducationLevelEnum.nullable()
    .default(null)
    .describe(
      "Definition: The minimum level of education required. Inference Guide: Extract from the 'Required education' section. Normalize Czech terms: 'Středoškolské' -> High School/Secondary, 'Bakalářské' -> Bachelor's Degree, 'Vysokoškolské' -> Master's Degree.",
    ),

  securityClearanceRequired: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if a security clearance is required. Inference Guide: Set to TRUE if the ad mentions working in sensitive sectors (e.g., Defense, Government IT, 'DEFENSE sektoru') or explicitly requests security clearance. Default to FALSE.",
    ),

  certificationsRequired: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of specific professional certifications or licenses required. Inference Guide: Extract explicit requirements, such as 'Driver's License (Group B)', 'CISSP', 'CCNA (Mandatory)'.",
    ),

  requiredSoftSkills: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of essential interpersonal and non-technical skills required. Inference Guide: Extract skills mentioned in the personality profile section. Examples: 'Communication', 'Teamwork' ('týmový hráč'), 'Analytical thinking'.",
    ),

  requiredLanguages: z
    .array(LanguageRequirementSchema)
    .default([])
    .describe(
      "Definition: List of human languages required for the role, including proficiency levels. Inference Guide: Extract languages and levels from the 'Required languages' section. Ensure normalization of proficiency levels.",
    ),
});
