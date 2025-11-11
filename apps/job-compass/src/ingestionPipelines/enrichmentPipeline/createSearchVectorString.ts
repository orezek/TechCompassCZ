import { closeCloudMongoInstance } from "../../mongoConnectionDb.js";
import { getCloudEnrichedJobRecordsCollection } from "../../mongoConnectionDb.js";
import { searchVectorStringBuilder } from "../../utils/searchVectorStringBuilder.js";
import type {AnyBulkWriteOperation} from "mongodb";
import type {EnrichedJobRecordsSchema} from "../../schemas/enrichedJobSchema/enrichedJobSchema.js";

const enrichedCloudJobRecordsCollection = await getCloudEnrichedJobRecordsCollection();
if (!enrichedCloudJobRecordsCollection) throw new Error("Failed to connect to DB.");

const jobAdsNew = enrichedCloudJobRecordsCollection.find({"searchMetadata.jobDescriptionCleaned": {"$exists": true}})
console.log("Processing jobs: ", await enrichedCloudJobRecordsCollection.countDocuments({"searchMetadata.jobDescriptionCleaned": {"$exists": true}}));
const writableJobAds = await jobAdsNew
  .map((jobAd) => {
    const vectorString = searchVectorStringBuilder(jobAd);
    console.log(`JobId: ${jobAd._id} : ${vectorString}`);
    const vectorStringRecord: AnyBulkWriteOperation<EnrichedJobRecordsSchema> =
      {
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

if (writableJobAds.length > 0) {
  await enrichedCloudJobRecordsCollection.bulkWrite(writableJobAds);
  console.log("Writing to DB finished.");
}
await closeCloudMongoInstance();