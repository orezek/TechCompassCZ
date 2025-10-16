import { MongoClient } from "mongodb";

const uri = "mongodb://admin:password@localhost:27017";

export const client = new MongoClient(uri);

export async function connectToDb() {
  try {
    await client.connect();
    console.log("Connected to Mongo.");
  } catch (error) {
    console.log("Failed to connect to Mongo", error);
    process.exit(1);
  }
}
