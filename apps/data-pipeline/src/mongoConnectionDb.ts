import { MongoClient } from "mongodb";

const cloudUri = "mongodb+srv://jobcompass:jobcompass*@jobcompas.2wbteqm.mongodb.net/?appName=JobCompas"

const localUri = "mongodb://admin:password@localhost:27017";


export const localClient = new MongoClient(localUri);
export const cloudClient = new MongoClient(cloudUri);

export async function connectToLocalMongo() {
  try {
    await localClient.connect();
    console.log("Connected to Local Mongo.");
  } catch (error) {
    console.log("Failed to connect to Local Mongo", error);
    process.exit(1);
  }
}

export const connectToCloudMongo = async () => {
  try {
    await cloudClient.connect();
    console.log("Connected to Cloud Mongo.");
  } catch (e) {
    console.log("Failed to connect to Cloud Mongo", e);
    process.exit(1);
  }
}
