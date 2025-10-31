
import * as dotenv from "dotenv";
import * as csv from "fast-csv";
import path from "path";
import fs from "fs";
import type { AnyBulkWriteOperation } from "mongodb";
import {
  getLocalStagedJobRecordsCollection,
  getLocalEnrichedJobRecordsCollection,
  closeLocalMongoInstance
} from "../mongoConnectionDb.js";

dotenv.config();

import { type StagedJobRecordsSchema } from "../schemas/stagedJobSchema/stagedJobRecordsSchema.js";
import { type EnrichedJobRecordsSchema } from "../schemas/enrichedJobSchema/enrichedJobSchema.js";

import { originalAdSchema } from "../schemas/enrichedJobSchema/originalJobAdSchema/originalAdSchema.js";
import { stagedJobRecordsSchema } from "../schemas/stagedJobSchema/stagedJobRecordsSchema.js";

const stagedJobsCollection = await getLocalStagedJobRecordsCollection();


async function jobAdExtractor() {
  let counter = 0;
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve("./sampleJobsCsv.csv");
    const results: StagedJobRecordsSchema[] = [];
    const dbCheckPromises: Promise<void>[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv.parse({ headers: true, trim: true, ignoreEmpty: true }))
      .transform((row, next) => {
        const jsonResult = stagedJobRecordsSchema.safeParse(row);
        if (jsonResult.success) {
          return next(null, jsonResult.data);
        } else {
          console.log("Transformed: ", jsonResult.error);
          return next();
        }
      })
      .on("error", (error) => {
        return reject(error);
      })
      .on("data", async (validJson) => {
        const checkPromise = (async () => {
          try {
            counter++;
            const document: StagedJobRecordsSchema | null = await stagedJobsCollection!.findOne({
              sourceId: validJson.sourceId,
            });
            if (!document) {
              results.push(validJson);
              console.log(`Inserted ad: ${counter} valid json: `, validJson);
            }
          } catch (error) {
            console.error("Database error", error);
            throw error;
          }
        })();
        dbCheckPromises.push(checkPromise);
      })
      .on("end", async (rowCount: number) => {
        await Promise.all(dbCheckPromises);
        if (results.length > 0) {
          await stagedJobsCollection!.insertMany(results);
        }
        console.log(`Parsed csv rows: ${rowCount}.`);
        console.log(`Inserted new objects: ${results.length}.`);
        return resolve(results.length);
      });
  });
}


async function enrichedJobsAdder() {
  const operations: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];
  const enrichedJobs = await getLocalEnrichedJobRecordsCollection();
  const stagedJobs = stagedJobsCollection!.find({});
  for await (const stagedJob of stagedJobs) {
    const result = originalAdSchema.safeParse(stagedJob);
    if (result.success) {
      const operation: AnyBulkWriteOperation<EnrichedJobRecordsSchema> = {
        updateOne: {
          filter: { _id: result.data._id },
          update: {
            $set: { originalAdData: result.data },
          },
          upsert: true,
        },
      };
      operations.push(operation);
    } else {
      throw new Error(result.error.message);
    }
  }
  if (operations.length > 0) {
    console.log(`Sending ${operations.length} operations to the database...`);
    const bulkResult = await enrichedJobs!.bulkWrite(operations);
    console.log(`Enriched jobs summary:`);
    console.log(`  - ${bulkResult.insertedCount} new jobs inserted.`);
    console.log(`  - ${bulkResult.modifiedCount} existing jobs updated.`);
    console.log(`  - ${bulkResult.upsertedCount} total upserts.`);
    console.log(`  - ${bulkResult.matchedCount} total matched records.`);
  } else {
    console.log("No valid jobs to process.");
  }
  await closeLocalMongoInstance();
  console.log("The DB has been closed");
}


try {
  await jobAdExtractor();
  console.log("The extraction ended!");
  console.log("File extraction ended well.");
  console.log("Starting to add enriched jobs objects");
  await enrichedJobsAdder();
} catch (error) {
  console.log(error);
} finally {
  await closeLocalMongoInstance();
}
