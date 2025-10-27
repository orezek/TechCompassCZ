// All correct v1.x imports
import { MongoDBAtlasVectorSearch, MongoDBStore } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ParentDocumentRetriever } from "langchain/retrievers/parent_document";
import { Document } from "@langchain/core/documents";

import {
  getCloudChunkDocumentCollection,
  getCloudParentDocumentCollection,
  getLocalEnrichedJobRecordsCollection
} from "../mongoConnectionDb.js";

const VECTOR_INDEX_NAME = "vector_index";

const enrichedJobCollection = await getLocalEnrichedJobRecordsCollection();
const parentDocumentCollection = await getCloudParentDocumentCollection();
const chunkCollection = await getCloudChunkDocumentCollection();

const ID_KEY = "doc_id";

async function setupRetriever() {

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
  });


  const vectorstore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: chunkCollection!,
    indexName: VECTOR_INDEX_NAME,
    embeddingKey: "embedding",
  });

  const docstore = new MongoDBStore({
    collection: parentDocumentCollection!,
    primaryKey: ID_KEY,
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const retriever = new ParentDocumentRetriever({
    vectorstore,
    docstore,
    childSplitter: splitter,
    idKey: ID_KEY,
    childK: 20,
  })
  return {retriever}
}