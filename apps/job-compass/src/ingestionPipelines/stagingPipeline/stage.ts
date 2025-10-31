import { createReadStream } from 'fs';
import { parse } from 'fast-csv';
import { stagedJobRecordsSchema } from "../../schemas/stagedJobSchema/stagedJobRecordsSchema.js";
import { getLocalStagedJobRecordsCollection } from "../../mongoConnectionDb.js";
import { createZodValidatorStream } from "./zodTransformStream.js";
import { createMongoBatchStream } from "./mongoDbWriteStream.js";

//
// --- DEFINE ALL YOUR FUNCTIONS AND IMPORTS FIRST ---
//

// --- CREATE AN ASYNC MAIN FUNCTION TO RUN THE APP ---
async function runIngestionPipeline() {
  console.log('Connecting to database...');

  // 1. AWAIT the database connection FIRST
  const stagedJobsCollection = await getLocalStagedJobRecordsCollection();

  // Your function exits on fail, but a check is good practice
  if (!stagedJobsCollection) {
    throw new Error('Database connection failed, cannot start pipeline.');
  }

  console.log('Database connected. Setting up pipeline...');

  // 2. NOW that you have the collection, set up the streams
  const fileStream = createReadStream('./sampleJobsCsv.csv');

  const csvParser = parse({ headers: true, trim: true, ignoreEmpty: true });

  const validatorStream = createZodValidatorStream(stagedJobRecordsSchema);

  // This line is no longer a problem, 'stagedJobsCollection' is a real object
  const mongoStream = createMongoBatchStream({
    collection: stagedJobsCollection,
    batchSize: 1000,
    keyField: 'sourceId',
  });

  // 3. Run the pipeline
  console.log('Starting ingestion...');

  // We must "promisify" the stream to await its completion
  return new Promise<void>((resolve, reject) => {
    fileStream
      .pipe(csvParser)
      .pipe(validatorStream)
      .pipe(mongoStream)
      .on('finish', () => {
        console.log('✅ Successfully finished writing to MongoDB.');
        resolve(); // Signal success
      })
      .on('error', (err) => {
        console.error('❌ Pipeline failed:', err.message);
        reject(err); // Signal failure
      });
  });
}

// --- START THE APPLICATION ---
runIngestionPipeline()
  .then(() => {
    console.log('Pipeline complete. Exiting.');
    process.exit(0); // Explicitly exit with a success code
  })
  .catch((err) => {
    console.error('An unrecoverable error occurred:', err);
    process.exit(1); // Exit with a failure code
  });