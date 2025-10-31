import { geminiFlashLite } from "../models/google/geminiModels.js";
import * as hub from "langchain/hub/node";
import {closeLocalMongoInstance, getLocalEnrichedJobRecordsCollection} from "../mongoConnectionDb.js";
import type { EnrichedJobRecordsSchema } from "../schemas/enrichedJobSchema/enrichedJobSchema.js";
import type { AnyBulkWriteOperation } from "mongodb";
import { searchVectorStringBuilder } from "../utils/searchVectorStringBuilder.js";

const jobAdsCollection: EnrichedJobRecordsSchema[] = [];
const jobDescriptionPrompt = await hub.pull("job-descripton-extractor");
const chain = jobDescriptionPrompt.pipe(geminiFlashLite);

const enrichedJobsRecordsCollection = await getLocalEnrichedJobRecordsCollection();
if (!enrichedJobsRecordsCollection) {
  throw new Error("Failed to connect to enriched-job-records collection.");
} else {
  const jobAds = enrichedJobsRecordsCollection.find({});
  for await (const jobAd of jobAds) {
    console.log(jobAd._id);
    if (jobAd.originalAdData?.jobDescription && jobAd.originalAdData._id) {
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
  await enrichedJobsRecordsCollection.bulkWrite(operations);
  console.log("Writing has finished.");


  // Create a search vector string a composite of other fields.
  const jobAdsNew = enrichedJobsRecordsCollection.find({});

  const writableJobAds = await jobAdsNew
    .map((jobAd) => {
      const vectorString = searchVectorStringBuilder(jobAd);
      console.log(`JobId: ${jobAd._id} : ${vectorString}`);
      const vectorStringRecord: AnyBulkWriteOperation<EnrichedJobRecordsSchema> = {
        updateOne: {
          filter: { _id: jobAd._id },
          update: {
            $set: { "searchMetadata.searchVectorString": vectorString },
          },
        },
      };
      return vectorStringRecord;
    })
    .toArray();

  await enrichedJobsRecordsCollection.bulkWrite(writableJobAds);
  console.log("Writing to DB finished.");
}
await closeLocalMongoInstance();
