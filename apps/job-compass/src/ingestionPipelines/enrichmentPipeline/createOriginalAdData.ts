import {
  getLocalStagedJobRecordsCollection,
  getCloudEnrichedJobRecordsCollection,
  closeLocalMongoInstance, getLocalEnrichedJobRecordsCollection, closeCloudMongoInstance
} from "../../mongoConnectionDb.js";
import type {AnyBulkWriteOperation} from "mongodb";
import type {EnrichedJobRecordsSchema} from "../../schemas/enrichedJobSchema/enrichedJobSchema.js";
import {originalAdSchema} from "../../schemas/enrichedJobSchema/originalJobAdSchema/originalAdSchema.js";

const writeOps: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];

const cloudEnrichedJobsCollection = await getCloudEnrichedJobRecordsCollection();
const localStageJobsCollection = await getLocalStagedJobRecordsCollection();
const localEnrichedJobsCollection = await getLocalEnrichedJobRecordsCollection();

if (!cloudEnrichedJobsCollection || !localStageJobsCollection || !localEnrichedJobsCollection) {
  console.error("Failed to connect to DB.");
  process.exit(1);
}

const stagedJobs = localStageJobsCollection.find({});

for await (const stagedJob of stagedJobs) {
  const parsedOriginalAdPart = originalAdSchema.safeParse(stagedJob);
  if (parsedOriginalAdPart.success)
  {
    const writeOp: AnyBulkWriteOperation<EnrichedJobRecordsSchema> = {
      updateOne: {
        filter: {parentId: stagedJob._id},
        update: {
          $set: {
            parentId: stagedJob._id,
            originalAdData: parsedOriginalAdPart.data},
        },
        upsert: true,
      }
  }
  writeOps.push(writeOp);
  } else {
    throw new Error(`Writing to the DB failed ${parsedOriginalAdPart.error.message.toString()}`);
  }
}

if (writeOps.length > 0) {
  console.log(`Sending ${writeOps.length} operations to the database...`);
  const bulkResult = await cloudEnrichedJobsCollection.bulkWrite(writeOps);
  await localEnrichedJobsCollection.bulkWrite(writeOps);
  console.log(`Enriched jobs summary:`);
  console.log(`  - ${bulkResult.insertedCount} new jobs inserted.`);
  console.log(`  - ${bulkResult.modifiedCount} existing jobs updated.`);
  console.log(`  - ${bulkResult.upsertedCount} total upserts.`);
  console.log(`  - ${bulkResult.matchedCount} total matched records.`);
} else {
  console.log("No valid jobs to process.");
}
await closeLocalMongoInstance();
await closeCloudMongoInstance();
console.log("The DB has been closed");

