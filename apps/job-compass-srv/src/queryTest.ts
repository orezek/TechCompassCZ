import { getCloudSearchJobCollection, getCloudEnrichedJobRecordsCollection } from "./mongoConnectionDb.js";
import { googleEmbeddingModel} from "./models/google/embeddingModels.js";
import { ObjectId } from "mongodb";
import {randomInt} from "crypto";

const cloudSearchJobCollection = await getCloudSearchJobCollection();
const cloudEnrichedJobCollection = await getCloudEnrichedJobRecordsCollection();

if (!cloudSearchJobCollection || !cloudEnrichedJobCollection) throw new Error("Database failed to connect!");

const queryToEmbed = "Part time or job for 20 hours a week job.";
const embeddedQuery = await googleEmbeddingModel.embedQuery(queryToEmbed);


const mongoDbQuery = [{
    $vectorSearch: {
      index: "jobs-vector-index",
      path: "embedding",
      queryVector: embeddedQuery,
      numCandidates: 500,
      limit: 20,
      filter: {
        companySize: "SME (51-250)",
      }
      }
    },
  {
    $project: {
      parentId: 1,
      score: {$meta: "vectorSearchScore"},
      pageContent: 1,
    }
  }
]

const queryResult = await cloudSearchJobCollection.aggregate(mongoDbQuery).toArray();
const parent = new ObjectId(queryResult[0]!.parentId);
const doc = await cloudEnrichedJobCollection.findOne({"_id": queryResult[0]!.parentId});
console.log("new object: ", new ObjectId(queryResult[0]!.parentId));
console.log("Number of returned results: ", queryResult.length);
console.log(queryResult[0]);
console.log("Original job: ", JSON.stringify(doc?.originalAdData));

// await closeCloudMongoInstance();

export async function jobSearch(query: string) {
  const cloudSearchJobCollection = await getCloudSearchJobCollection();
  if (!cloudSearchJobCollection || !cloudEnrichedJobCollection) throw new Error("Database failed to connect!");
  const embeddedQuery = await googleEmbeddingModel.embedQuery(query);
  const mongoDbQuery = [{
    $vectorSearch: {
      index: "jobs-vector-index",
      path: "embedding",
      queryVector: embeddedQuery,
      numCandidates: 500,
      limit: 20,
      // filter: {
      //   companySize: "SME (51-250)",
      // }
    }
  },
    {
      $project: {
        parentId: 1,
        score: {$meta: "vectorSearchScore"},
        pageContent: 1,
      }
    }
  ]
  const result = await cloudSearchJobCollection.aggregate(mongoDbQuery).toArray();
  const index = randomInt(1, 15);
  const doc = await cloudEnrichedJobCollection.findOne({"_id": result[index]!.parentId})
  return JSON.stringify(doc!.originalAdData);
}