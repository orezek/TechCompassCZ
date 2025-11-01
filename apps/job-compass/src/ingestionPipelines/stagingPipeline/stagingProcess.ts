import { createReadStream } from "fs";
import { parse } from "fast-csv";
import { stagedJobRecordsSchema } from "../../schemas/stagedJobSchema/stagedJobRecordsSchema.js";
import {closeLocalMongoInstance, getLocalStagedJobRecordsCollection } from "../../mongoConnectionDb.js";
import { createZodValidatorStream } from "./zodTransformStream.js";
import { pipeline } from "node:stream/promises";
import type { Collection } from "mongodb";
import { ZodType } from "zod";
import type { Document } from "mongodb";
import { MongoBatchWritable } from "./mongoDbWriteStream.js";

const CSV_FILE_PATH = "./cleaned_jobs_csv.csv";

async function runIngestionPipeline<T extends Document>( mongoDbCollection: Collection<T>, csvFilePath: string, zodSchema: ZodType) {
  console.log("Verifying connection to database...");
  if (!mongoDbCollection) {
    throw new Error("Database connection failed, cannot start pipeline.");
  }
    console.log("Database connected. Setting up pipeline...");
  try {
    console.log("Verifying input file...");
    const sourceFileReadStream = createReadStream(csvFilePath);
    const csvParserTransformStream = parse({
      headers: true,
      trim: true,
      ignoreEmpty: true,
    });
    const zodSchemaTransformStream = createZodValidatorStream(zodSchema);
    const mongoDbWriteStream = new MongoBatchWritable({
      collection: mongoDbCollection,
      batchSize: 1000,
      keyField: "sourceId",
    });
    console.log("Starting ingestion process...");
    await pipeline(
      sourceFileReadStream,
      csvParserTransformStream,
      zodSchemaTransformStream,
      mongoDbWriteStream,
    );
  } catch (e) {
    console.error("Error: ", e);
    await closeLocalMongoInstance();
    process.exit(1);
  }
}

const stagedCollection = await getLocalStagedJobRecordsCollection();
if (!stagedCollection) {
  throw new Error("Database connection failed, cannot start pipeline.");
}
await runIngestionPipeline(
  stagedCollection,
  CSV_FILE_PATH,
  stagedJobRecordsSchema,
);
console.log("Data ingested.");
await closeLocalMongoInstance();
process.exit(0);
