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

// Schema Definition
export const locationAndWorkModelSchema = z.object({
  locationCity: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "Definition: The primary city of the office or work location. Inference Guide: Extract the city name. Normalize by removing districts (e.g., 'Praha – Karlín' becomes 'Prague').",
    ),

  locationCountry: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "Definition: The country of the work location. Inference Guide: Infer from the city or explicit mention. Normalize to the full country name (e.g., 'CZ' or 'Česko' becomes 'Czech Republic').",
    ),

  workModel: WorkModelEnum.nullable()
    .default(null)
    .describe(
      "Definition: The location model for the job. Inference Guide: 'Remote' if 'plně remote' or '100% Home Office'. 'Hybrid-office-first' if 3+ days in office (e.g., '3 days onsite / 2 days remote'). 'Hybrid-remote-first' if 1-2 days in office or occasional visits. 'On-site' if no remote options are mentioned.",
    ),

  remoteWithinCountry: z
    .boolean()
    .default(true)
    .describe(
      "Definition: Indicates if remote work is restricted to the hiring country. Inference Guide: Assume TRUE (restricted) unless the ad explicitly states 'work from anywhere globally'.",
    ),

  travelRequirement: TravelRequirementEnum.nullable()
    .default(null)
    .describe(
      "Definition: The frequency and nature of business travel. Inference Guide: Infer from responsibilities. 'Occasional local support' maps to 'Occasional Local'. Mentions of 'zahraniční cesty' (foreign travel) or specific countries (e.g., USA, Korea) map to 'International'. If unmentioned, use 'None'.",
    ),

  onCallDuty: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the role requires on-call availability or shift work. Inference Guide: Set to TRUE if the ad mentions '24/7 support', 'on-call rotation', 'pohotovost' (standby duty), or 'směnný provoz' (shift work). Default to FALSE.",
    ),

  flexibleWorkingHours: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the employer offers flexible start/end times. Inference Guide: Set to TRUE if 'Flexible working hours', 'Pružná pracovní doba', or 'Flexibilní začátek/konec pracovní doby' is explicitly mentioned. Default to FALSE.",
    ),

  officeEnvironment: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of keywords describing the office setup and amenities. Inference Guide: Extract specific keywords from the benefits or company description, such as 'Dog-friendly', 'Modern Offices', 'Refreshments available' ('Občerstvení na pracovišti').",
    ),
});
