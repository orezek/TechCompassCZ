import {closeCloudMongoInstance, getCloudEnrichedJobRecordsCollection} from "../../mongoConnectionDb.js";
import { getCloudSearchJobCollection } from "../../mongoConnectionDb.js";
import {Document} from "@langchain/core/documents";
import {RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from "dotenv";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import type {EnrichedJobRecordsSchema} from "../../schemas/enrichedJobSchema/enrichedJobSchema.js";

const cloudEnrichedCollection = await getCloudEnrichedJobRecordsCollection();
const cloudSearchJobCollection = await getCloudSearchJobCollection();

dotenv.config();

if (!cloudEnrichedCollection || !cloudSearchJobCollection) throw new Error("Connection to database failed.");


const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "embedding-001",
})


const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 750,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " ", ""],
})


const enrichedDocs = await cloudEnrichedCollection.find<EnrichedJobRecordsSchema>({}).toArray();

const rawDocuments = enrichedDocs.map((doc) => {
  return new Document({
    pageContent: doc.searchMetadata?.jobDescriptionCleaned ?? "Not Specified",
    metadata: {
      parentId: doc._id,
      employmentType: doc.analyticalInsights?.contractualDetails?.employmentType ?? "Not Specified",
      contractType: doc.analyticalInsights?.contractualDetails?.contractType ?? "Not Specified",
      contractDuration: doc.analyticalInsights?.contractualDetails?.contractDuration ?? "Not Specified",
      workModel: doc.analyticalInsights?.locationAndWorkModel?.workModel ?? "Not Specified",
      companySize: doc.analyticalInsights?.companyAndTeamContext?.companySize ?? "Not Specified",
      companyType: doc.analyticalInsights?.companyAndTeamContext?.companyType ?? "Not Specified",
      teamSize: doc.analyticalInsights?.companyAndTeamContext?.teamSize ?? "Not Specified",
      technologyMaturity: doc.analyticalInsights?.workloadAndEnvironmentContext?.technologyMaturity ?? "Not Specified",
      autonomyLevel: doc.analyticalInsights?.culturalAndPsychologicalIndicators?.autonomyLevel ?? "Not Specified",
      seniorityLevel: doc.analyticalInsights?.corePositionDetails?.seniorityLevel ?? "Not Specified",
      industryVertical: doc.analyticalInsights?.corePositionDetails?.industryVertical ?? "Not Specified"
    }
  })
});

const chunkedDocs = await splitter.splitDocuments(rawDocuments);

// console.log(chunkedDocs[0]);
// console.log(chunkedDocs[1]);

// Use Langchain library to save chunk documents to the collection.
await MongoDBAtlasVectorSearch.fromDocuments(
  chunkedDocs,
  embeddings,
  {
    collection: cloudSearchJobCollection,
    textKey: "pageContent",
    embeddingKey: "embedding",
  }
)

console.log("Embeddings processed.")

await closeCloudMongoInstance();