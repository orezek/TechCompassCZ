import { geminiFlashLite } from "../../models/google/geminiModels.js";
import * as hub from "langchain/hub/node";
import {
  closeLocalMongoInstance,
  getLocalEnrichedJobRecordsCollection,
  getCloudEnrichedJobRecordsCollection, closeCloudMongoInstance
} from "../../mongoConnectionDb.js";
import type { EnrichedJobRecordsSchema } from "../../schemas/enrichedJobSchema/enrichedJobSchema.js";
import type { AnyBulkWriteOperation } from "mongodb";

const jobAdsCollection: EnrichedJobRecordsSchema[] = [];
const jobDescriptionPrompt = await hub.pull("job-descripton-extractor");
const chain = jobDescriptionPrompt.pipe(geminiFlashLite);

const enrichedJobsRecordsCollection = await getLocalEnrichedJobRecordsCollection();
const enrichedCloudJobRecordsCollection = await getCloudEnrichedJobRecordsCollection();

if (!enrichedJobsRecordsCollection || !enrichedCloudJobRecordsCollection) {
  throw new Error("Failed to connect to enriched-job-records collection.");
} else {
  const jobAds = enrichedCloudJobRecordsCollection.find({
    "analyticalInsights": { "$exists": true },
    "searchMetadata.jobDescriptionCleaned": { "$exists": false }
  });
  console.log("Number of documents to process: ", await enrichedCloudJobRecordsCollection.countDocuments({
    "analyticalInsights": { "$exists": true },
    "searchMetadata.jobDescriptionCleaned": { "$exists": false }
  }));
  for await (const jobAd of jobAds) {
    console.log(jobAd._id);
    if (jobAd.originalAdData!.jobDescription) {
      jobAdsCollection.push(jobAd);
    }
  }
  console.log(`Number of object ads to process: ${jobAdsCollection.length}`);
  // Cleaning the original job description
  const chainPromises = jobAdsCollection.map(async (jobAd) => {
    try {
      const airsults = await chain.invoke({
        question: jobAd.originalAdData?.jobDescription,
      });

      return {
        jobAdId: jobAd._id,
        airesult: airsults,
      };
    } catch (e) {
      console.log(`Failed to process AI for jobAd ${jobAd._id}`, e);
      return null;
    }
  });
  const resultsWithIds = await Promise.all(chainPromises);
  // Saving them to DB
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
  await enrichedCloudJobRecordsCollection.bulkWrite(operations);
  console.log("Writing has finished.");
}
await closeLocalMongoInstance();
await closeCloudMongoInstance();
