import {geminiFlashLite} from "../models/google/geminiModels.js";
import {googleEmbeddingModel} from "../models/google/embeddingModels.js";
import { MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import {closeCloudMongoInstance, getCloudChunkDocumentCollection} from "../mongoConnectionDb.js";
import type { Document } from "@langchain/core/documents";

// new
import { createAgent, tool} from "langchain";
import * as z from "zod";

const ragChunkCollection = await getCloudChunkDocumentCollection();
if (!ragChunkCollection) throw new Error("Check your Mongo Database connection!");


const retriever = new MongoDBAtlasVectorSearch(googleEmbeddingModel, {
  collection: ragChunkCollection,
  indexName: "vector_index",
  textKey: "text",
  embeddingKey: "embedding",
})

const retrieveDocs = tool (
  async (input) => {
    console.log(input);
    const results: Document[] = await retriever.similaritySearch(input.query, 5);
    return results.map((d) => d.pageContent).join("\n\n");
  },
  {
    name: "retrieve_docs",
    description: "Retrieve the most relevant documents for a user query",
    schema: z.object({
      query: z.string().describe("User's information need or question."),
    }),
  }
)


const agent = createAgent({
  model: geminiFlashLite,
  tools: [retrieveDocs],
  systemPrompt: `You are a retrieval-augmented question answering agent.
    When asked something, use the 'retrieve_docs' tool to fetch relevant context.
    Always base your answer on the retrieved context.
    Be concise and accurate. If information is missing, say so. If the tools did not find the information, report it to the user. Always output to the user the query you asked the tool.`,
})

const response = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "Is there any job as an DB admin?",
    },
  ],
});
const finalMessage = response.messages.at(-1);
console.log(finalMessage?.content);

//
// const results: Document[] = await retriever.similaritySearch("hovno", 5);
// console.log("Printing from DB");
// console.log(results);
await closeCloudMongoInstance();
