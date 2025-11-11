import { z } from "zod";

// =================================================================
// 2. Location and Work Model
// =================================================================

// Enum Definitions
const WorkModelEnum = z.enum([
  "On-site",
  "Remote",
  "Hybrid-office-first", // 3+ days in office per week
  "Hybrid-remote-first", // 1-2 days in office per week or less frequent
]);

const TravelRequirementEnum = z.enum([
  "None",
  "Occasional Local",
  "Frequent Domestic",
  "International",
]);

const RemoteWorkPolicyEnum = z.enum([
  "NotApplicable", // Use this if workModel is 'On-site'
  "CountryRestricted", // Default for Hybrid/Remote if nothing else is said
  "RegionRestricted", // e.g., "EU only"
  "Global", // e.g., "Work from anywhere"
]);

// Schema Definition
export const locationAndWorkModelSchema = z.object({
  locationCity: z
    .string()
    .nullable()
    .default(null)
    .describe(
      `Definition: The primary city of the office or work location.
    Inference Guide: Extract the city name mentioned.
    -   Normalize by removing districts (e.g., 'Praha – Karlín' -> 'Prague').
    -   If another city is mentioned (e.g., 'Brno', 'Ostrava'), return it AS-IS.`,
    ),

  locationCountry: z
    .string()
    .nullable()
    .default(null)
    .describe(
      `Definition: The country of the work location.
    Inference Guide: Infer from city or explicit mention.
    -   Normalize abbreviations (e.g., 'CZ'/'Česko' -> 'Czech Republic', 'DE'/'Německo' -> 'Germany').
    -   If a full name is used (e.g., 'Slovakia'), return it AS-IS.`,
    ),

  workModel: WorkModelEnum.nullable()
    .default("On-site")
    .describe(
      "Definition: The location model for the job. Inference Guide: 'Remote' if 'plně remote' or '100% Home Office'. 'Hybrid-office-first' if 3+ days in office (e.g., '3 days onsite / 2 days remote'). 'Hybrid-remote-first' if 1-2 days in office or occasional visits. 'On-site' if no remote options are mentioned. Use 'null' ONLY if the ad is too short or ambiguous to determine a model",
    ),

  remoteWorkPolicy: RemoteWorkPolicyEnum.nullable()
    .default(null)
    .describe(
      `Definition: Specifies where remote work can be performed.
    Inference Guide: THIS FIELD IS LOGICALLY DEPENDENT ON 'workModel'.
    1.  If 'workModel' is 'On-site', this MUST be 'NotApplicable'.
    2.  If the ad mentions 'work from anywhere', 'global', or 'bez omezení' (without limitation), set to 'Global'.
    3.  If the ad mentions a region (e.g., 'EU only', 'within Europe'), set to 'RegionRestricted'.
    4.  If 'workModel' is 'Remote' or 'Hybrid' and rules 2 & 3 don't apply, set to 'CountryRestricted' (this is the default assumption).
    5.  If 'workModel' is null, this should also be null.`,
    ),

  travelRequirement: TravelRequirementEnum.nullable()
    .default("None")
    .describe(
      "Definition: The frequency and nature of business travel. Inference Guide: Infer from responsibilities. 'Occasional local support' maps to 'Occasional Local'. Mentions of 'zahraniční cesty' (foreign travel) or specific countries (e.g., USA, Korea) map to 'International'. If unmentioned, use 'None'.",
    ),

  onCallDuty: z
    .boolean()
    .default(false)
    .describe(
      `Definition: Indicates if the role requires on-call availability or shift work.
    Inference Guide: Set to TRUE if *explicitly stated* ('pohotovost', 'směnný provoz')
    OR if *strongly implied* (e.g., '24/7 support', 'on-call rotation', 'rotating weekend schedule'). Default to FALSE.`,
    ),

  flexibleWorkingHours: z
    .boolean()
    .default(false)
    .describe(
      `Definition: Indicates if the employer offers flexible start/end times.
    Inference Guide: Set to TRUE if *explicitly stated* ('Pružná pracovní doba')
    OR if *strongly implied* by examples (e.g., 'core hours 10-3', 'manage your own schedule'). Default to FALSE.`,
    ),

  officeEnvironment: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of keywords describing the office setup and amenities. Inference Guide: Extract specific keywords from the benefits or company description, such as 'Dog-friendly', 'Modern Offices', 'Refreshments available' ('Občerstvení na pracovišti').",
    ),
});
