import { geminiFlashLite } from "../models/geminiModels.js";
import * as hub from "langchain/hub/node";
import { connectToLocalMongo } from "../mongoConnectionDb.js";
import { localClient } from "../mongoConnectionDb.js";
import type { EnrichedJobRecordsSchema } from "../schemas/enrichedJobSchema/enrichedJobSchema.js";
import type { AnyBulkWriteOperation } from "mongodb";
import { searchVectorStringBuilder } from "../utils/searchVectorStringBuilder.js";

await connectToLocalMongo();
const collection = localClient
  .db("it-jobs")
  .collection<EnrichedJobRecordsSchema>("enriched-job-records");

const jobDescriptionPrompt = await hub.pull("job-descripton-extractor");

const chain = jobDescriptionPrompt.pipe(geminiFlashLite);

const jobAds = collection.find({});

const jobAdsCollection: EnrichedJobRecordsSchema[] = [];

for await (const jobAd of jobAds) {
  console.log(jobAd._id);
  if (jobAd.originalAdData?.jobDescription && jobAd.originalAdData._id) {
    jobAdsCollection.push(jobAd);
  }
}

console.log(`Number of object ads to process: ${jobAdsCollection.length}`);

const processingPromises = jobAdsCollection.map(async (jobAd) => {
  try {
    const airsults = await chain.invoke({
      question: jobAd.originalAdData?.jobDescription,
    });

    return {
      jobAdId: jobAd._id,
      airesult: airsults,
    };
  } catch (e) {
    console.log(`Failed to process AI for jobAd ${jobAd._id}`);
    return null;
  }
});

const resultsWithIds = await Promise.all(processingPromises);

const operations: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];
for (const item of resultsWithIds) {
  if (item && item.airesult?.content) {
    const operation: AnyBulkWriteOperation<EnrichedJobRecordsSchema> = {
      updateOne: {
        filter: { _id: item.jobAdId },
        update: {
          $set: {
            "searchMetadata.jobDescriptionCleaned": item.airesult.content
              .toString()
              .replace(/\s+/g, " "),
          },
        },
      },
    };
    operations.push(operation);
  }
}

await collection.bulkWrite(operations);
console.log("Writing has finished.");
const jobAdsNew = collection.find({});

const writableJobAds = await jobAdsNew
  .map((jobAd) => {
    const vectorString = searchVectorStringBuilder(jobAd);
    console.log(`JobId: ${jobAd._id} : ${vectorString}`);
    const operation: AnyBulkWriteOperation<EnrichedJobRecordsSchema> = {
      updateOne: {
        filter: { _id: jobAd._id },
        update: {
          $set: { "searchMetadata.searchVectorString": vectorString },
        },
      },
    };
    return operation;
  })
  .toArray();

await collection.bulkWrite(writableJobAds);
console.log("Writing to DB finished.");

await localClient.close();
