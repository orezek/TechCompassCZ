// namespace import - correct way to import commonJs to ES Module (ESM)
import * as dotenv from "dotenv";
import * as csv from "fast-csv";
import path from "path";
import fs from "fs";
import {
  jobDescriptionSchema,
  jobDetailsSchema,
  companyIntroSchema,
} from "./schemas/enrichedJobsSchema.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as hub from "langchain/hub/node";
// import {testSchema} from "./schemas/testSchema.js";

import { connectToDb, client } from "./mongoConnectionDb.js";
// Load env vars to node.js engine
dotenv.config();

// Load schemas
import {
  type StagedJobSchema,
  stagedJobSchema,
} from "./schemas/stagedJobSchema.js";
import {
  type EnrichedJobSchema,
  enrichedJobSchema,
} from "./schemas/enrichedJobsSchema.js";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

await connectToDb();
const db = client.db("it-jobs");
const staged_jobs = db.collection<StagedJobSchema>("staged-jobs");

async function fileExtractor() {
  let counter = 0;
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve("./sampleJobsCsv.csv");
    const results: StagedJobSchema[] = [];
    const dbCheckPromises: Promise<void>[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv.parse({ headers: true, trim: true, ignoreEmpty: true }))
      .transform((row, next) => {
        const jsonResult = stagedJobSchema.safeParse(row);
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
            // here you define the db connection and insert validated json as it comes one by one
            counter++;
            const document: StagedJobSchema | null = await staged_jobs.findOne({
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
          await staged_jobs.insertMany(results);
        }
        console.log(`Parsed csv rows: ${rowCount}.`);
        console.log(`Inserted new objects: ${results.length}.`);
        return resolve(results.length);
      });
  });
}

async function askGemini(jobDescription: string) {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    temperature: 0,
  });

  // use benefitsSchema

  // Test 1 - printing PromptValues
  // const humanPrompt = PromptTemplate.fromTemplate(`What is the capital city of {country}.`);
  // const systemPrompt = PromptTemplate.fromTemplate("You are a geography teacher.");
  // const humMessage = new HumanMessagePromptTemplate({prompt: humanPrompt});
  // const sysMessage = new SystemMessagePromptTemplate({prompt: systemPrompt});
  // const finalMessages = ChatPromptTemplate.fromMessages([humMessage, sysMessage]);
  // const finalPrompt = await finalMessages.invoke({country: "Poland"});
  // console.log(finalPrompt.toChatMessages());
  // return finalPrompt.toChatMessages();

  // Test 2 calling model to generate the analysis
  // const prompt = await hub.pull("forensic-ad-analyzer");
  // const chain = prompt.pipe(model);
  // const result = await chain.invoke({
  //   jobDescription: jobDescription,
  // });

  // console.log(result.content);
  // return result;
}

async function enrichedJobsAdder() {
  const enrichedJobsArray: EnrichedJobSchema[] = [];
  await connectToDb();
  const enrichedJobs = db.collection<EnrichedJobSchema>("enriched-jobs");
  const query = {};
  const stagedJobs = staged_jobs.find(query);
  for await (const stagedJob of stagedJobs) {
    // console.log(stagedJob);
    const result = enrichedJobSchema.safeParse(stagedJob);
    if (result.success) {
      const doc: EnrichedJobSchema | null = await enrichedJobs.findOne({
        _id: result.data._id,
      });
      if (!doc) {
        enrichedJobsArray.push(result.data);
      }
    } else {
      throw new Error(result.error.message);
    }
  }
  if (enrichedJobsArray.length > 0) {
    await enrichedJobs.insertMany(enrichedJobsArray);
  }
  console.log(`Enriched jobs inserted: ${enrichedJobsArray.length}`);
  await client.close();
  console.log("The DB has been closed");
}

// async function dbReader() {
//   //await connectToDb();
//   const test_jobs = db.collection<TestSchema>("test-jobs");
//   const query = {};
//   const cursor = staged_jobs.find(query);
//   for await (const doc of cursor) {
//     console.log(`Document ID: ${doc._id}`);
//     const jobAnalysis = await askGemini(doc.jobDescription);
//     await test_jobs.insertOne({
//       adInfo: "Testing job analysis.",
//       adAnalysis: jobAnalysis.content.toString(),
//     });
//   }
// }

try {
  await askGemini("some text");
  await fileExtractor();
  console.log("The extraction ended!");
  //await client.close();
  //console.log("The DB has been closed");
  console.log("File extraction ended well.");
  // console.log("Starting to iterate over IT Jobs collection");
  // await dbReader();
  // console.log("Reading ended well.");
  console.log("Starting to add enriched jobs objects");
  await enrichedJobsAdder();
} catch (error) {
  console.log(error);
} finally {
  await client.close();
}
