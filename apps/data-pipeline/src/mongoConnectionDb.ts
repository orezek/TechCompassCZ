import {Db, MongoClient} from "mongodb";

const CLOUD_URI = "mongodb+srv://jobcompass:jobcompass%2A@jobcompas.2wbteqm.mongodb.net/?appName=JobCompas";
const LOCAL_URI = "mongodb://admin:password@localhost:27017";

const LOCAL_DB_NAME = 'it-jobs';
const CLOUD_DB_NAME = "it-jobs";

const LOCAL_STAGED_COLLECTION_NAME = "staged-job-records";
const LOCAL_ENRICHED_COLLECTION_NAME = "enriched-job-records";

const CLOUD_STAGED_COLLECTION_NAME = "staged-job-records";
const CLOUD_ENRICHED_COLLECTION_NAME = "enriched-job-records";
const CLOUD_PARENT_DOCUMENT_COLLECTION_NAME = "rag-parent";
const CLOUD_CHUNK_DOCUMENT_COLLECTION_NAME = "rag-chunk";


let localDb: Db | null = null;
let cloudDb: Db | null = null;
export const localClient = new MongoClient(LOCAL_URI);
export const cloudClient = new MongoClient(CLOUD_URI);


async function connectToLocalMongoInstance() {
  try {
    await localClient.connect();
    console.log("Connected to Local MongoDB.");
  } catch (error) {
    console.log("Failed to connect to Local MongoDB instance", error);
    process.exit(1);
  }
}

async function connectToLocalItJobsDB() {
  try {
    if (!localDb) {
      await connectToLocalMongoInstance();
      localDb = localClient.db(LOCAL_DB_NAME);
    }
    return localDb;
  } catch (e) {
    console.error("Failed to connect to Local It jobs db.", e);
  }
}

export const closeLocalMongoInstance = async () => {
  try {
    await localClient.close();
    console.log("Connection closed on Local MongoDB.");
  } catch (e) {
    console.error("Failed to close Local MongoDB instance: ", e);
  }
};



const connectToCloudMongoInstance = async () => {
  try {
    await cloudClient.connect();
    console.log("Connected to Cloud MongoDB.");
  } catch (e) {
    console.error("Failed to connect to Cloud MongoDB instance.", e);
    process.exit(1);
  }
};

async function connectToCloudItJobsDb() {
  try {
    if (!cloudDb) {
      await connectToCloudMongoInstance();
      cloudDb = cloudClient.db(CLOUD_DB_NAME);
    }
    return cloudDb;
  } catch (e) {
    console.error("Failed to connect to Cloud It jobs db.", e);
  }
}

export const closeCloudMongo =  async() => {
  try {
    await cloudClient.close();
    console.log("Connection closed on Cloud MongoDB.");
  } catch (e) {
    console.error("Failed to close Cloud MongoDB:", e);
  }
}


export async function connectToLocalStagedJobRecords() {
  try {
    const itJobsDb = await connectToLocalItJobsDB();
    if (itJobsDb) return itJobsDb.collection(LOCAL_STAGED_COLLECTION_NAME);
  } catch (e) {
    console.error("Failed to connect to local staged-jobs-records collection", e);
    process.exit(1);
  }
}

export async function connectToLocalEnrichedJobRecords() {
  try {
    const itJobsDb = await connectToLocalItJobsDB();
    if (itJobsDb) return itJobsDb.collection(LOCAL_ENRICHED_COLLECTION_NAME);
  } catch (e) {
    console.error("Failed to connect to local enriched-jobs-records collection", e);
    process.exit(1);
  }
}

export async function connectToCloudStageJobRecords() {
  try {
    const itJobsDb = await connectToCloudItJobsDb();
    if(itJobsDb) return itJobsDb.collection(CLOUD_STAGED_COLLECTION_NAME);
  } catch (e) {
    console.error("Failed to connect to cloud staged-jobs-records collection", e);
    process.exit(1);
  }
}

export async function connectToCloudEnrichedJobRecords() {
  try {
    const itJobsDb = await connectToCloudItJobsDb();
    if(itJobsDb) return itJobsDb.collection(CLOUD_ENRICHED_COLLECTION_NAME);
  } catch (e) {
    console.error("Failed to connect to cloud enriched-jobs-records collection", e);
    process.exit(1);
  }
}

export async function connectToCloudParentDocumentCollection() {
  try {
    const itJobsDb = await connectToCloudItJobsDb();
    if(itJobsDb) return itJobsDb.collection(CLOUD_PARENT_DOCUMENT_COLLECTION_NAME);
  } catch (e) {
    console.error("Failed to connect to cloud parent-chunks collection", e);
    process.exit(1);
  }
}

export async function connectToCloudChunkDocumentCollection() {
  try {
    const itJobsDb = await connectToCloudItJobsDb();
    if(itJobsDb) return itJobsDb.collection(CLOUD_CHUNK_DOCUMENT_COLLECTION_NAME);
  } catch (e) {
    console.error("Failed to connect to cloud rag-chunks collection", e);
    process.exit(1);
  }
}