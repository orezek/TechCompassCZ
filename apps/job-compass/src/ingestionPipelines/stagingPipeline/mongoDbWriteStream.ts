import { Writable, type WritableOptions} from "stream";
import { Collection, type Document} from "mongodb";
import type { StagedJobRecordsSchema } from "../../schemas/stagedJobSchema/stagedJobRecordsSchema.js";
import { getLocalStagedJobRecordsCollection} from "../../mongoConnectionDb.js";

// 1. Define the options for our factory
export interface MongoBatchStreamOptions<T extends Document> extends WritableOptions {
  collection: Collection<T>; // The MongoDB collection to write to
  batchSize?: number; // How many docs to write at once
  keyField: string; // The field to use for the upsert (e.g., 'sourceId')
}

/**
 * A type-safe factory function that creates a Writable stream
 * to batch-write documents to a MongoDB collection.
 */
export function createMongoBatchStream<T extends Document>(
  options: MongoBatchStreamOptions<T>
): Writable {
  const { collection, batchSize = 1000, keyField, ...writableOptions } = options;

  // This will be our internal buffer
  let batch: T[] = [];

  // This async function does the actual database work
  const flushBatch = async (): Promise<void> => {
    if (batch.length === 0) {
      return; // Nothing to do
    }

    // Get the batch and clear the internal one immediately
    const batchToFlush = batch;
    batch = [];

    // 1. Create the array of 'upsert' operations
    const operations = batchToFlush.map((doc) => ({
      updateOne: {
        filter: { [keyField]: doc[keyField] } as any, // Use the key field
        update: { $set: doc },
        upsert: true,
      },
    }));

    // 2. Run the bulkWrite operation
    // We use { ordered: false } for max speed. It won't stop on one error.
    await collection.bulkWrite(operations, { ordered: false });
  };

  // 3. Create and return the Writable stream
  return new Writable({
    ...writableOptions,
    objectMode: true, // We are accepting objects

    /**
     * This method is called for every object coming from the Zod stream.
     */
    async write(
      chunk: T,
      encoding: BufferEncoding,
      callback: (error?: Error | null) => void
    ) {
      batch.push(chunk as T);

      if (batch.length >= batchSize) {
        try {
          await flushBatch(); // Write to DB
          callback(); // Signal we are ready for the next chunk
        } catch (err) {
          callback(err as Error); // Signal an error
        }
      } else {
        // Batch not full yet, just ask for the next chunk
        callback();
      }
    },

    /**
     * This method is called right at the end, after all chunks are written.
     * It ensures the last remaining items in the batch are flushed.
     */
    async final(callback: (error?: Error | null) => void) {
      try {
        await flushBatch(); // Write the final, partial batch
        callback(); // Signal success
      } catch (err) {
        callback(err as Error); // Signal an error
      }
    },
  });
}