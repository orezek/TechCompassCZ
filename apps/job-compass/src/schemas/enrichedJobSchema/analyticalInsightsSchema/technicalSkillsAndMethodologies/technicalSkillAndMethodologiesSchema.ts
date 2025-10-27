import { z } from "zod";

// =================================================================
// 6. Technical Skills and Methodologies
// =================================================================

// Schema Definition
export const technicalSkillsAndMethodologiesSchema = z.object({
  coreTechStack: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of the primary technologies REQUIRED (Must-haves). Inference Guide: Extract technologies listed in the 'Requirements' or 'Bez čeho se neobejdete' (What you can't do without) sections. Normalize names (e.g., 'C#', '.NET', 'MS SQL', 'Git').",
    ),

  preferredTechStack: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of technologies that are advantageous but NOT strictly required (Nice-to-haves). Inference Guide: Extract technologies listed in 'Advantages', 'Výhodou je znalost' (Knowledge is an advantage), or 'Nice if you have' sections.",
    ),

  coreMethodologies: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of development or operational methodologies used. Inference Guide: Extract mentions of methodologies from requirements or descriptions of the work environment. Examples: Agile, Scrum, Kanban, DevOps, ITIL, CI/CD, TDD, Microservices.",
    ),
});
