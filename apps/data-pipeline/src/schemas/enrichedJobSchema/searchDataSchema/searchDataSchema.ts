import { z } from "zod";

export const searchDataSchema = z.object({
  jobDescriptionCleaned: z
    .string()
    .nullable()
    .describe(
      "Cleaned job description from noise focusing only on responsibilities, mandatory requirements, atc.",
    ),
  searchVectorString: z
    .string()
    .nullable()
    .describe("Search vector string used for embedding and semantic search."),
});
