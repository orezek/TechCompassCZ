import { z } from "zod";

import { originalAdSchema } from "./originalJobAdSchema/originalAdSchema.js";
import { analyticalInsightsSchema } from "./analyticalInsightsSchema/analyticalInsightsSchema.js";
import { pipelineMetadataSchema } from "./observabilitySchema/observabilitySchema.js";
import { searchDataSchema } from "./searchDataSchema/searchDataSchema.js";
import {ObjectId } from 'mongodb'
export const enrichedJobRecordsSchema = z.object({
  _id: z.instanceof(ObjectId).optional().describe("Unique document ID."),
  parentId: z.instanceof(ObjectId).describe("ID from StagedJob Collection _id field for lookups and reference"),
  originalAdData: originalAdSchema
    .nullable()
    .default(null)
    .describe(
      "Contains the raw text, original values, and source metadata of the advertisement.",
    ),
  analyticalInsights: analyticalInsightsSchema
    .optional()
    .describe(
      "Contains the deeply analyzed data: normalized extractions and inferred insights structured for analytical purposes (Set A).",
    ),
  _pipelineMetadata: pipelineMetadataSchema
    .optional()
    .describe(
      "Metadata for observability, tracking the processing history, model versions, and confidence scores.",
    ),
  searchMetadata: searchDataSchema
    .optional()
    .describe("Base data object for creating vector search."),
});

export type EnrichedJobRecordsSchema = z.infer<typeof enrichedJobRecordsSchema>;
