import { Writable, type WritableOptions } from "stream";
import { Collection, type Document } from "mongodb";

export interface MongoBatchWritableOptions<T extends Document>
  extends WritableOptions {
  collection: Collection<T>;
  batchSize?: number;
  keyField: keyof T;
}

export class MongoBatchWritable<T extends Document> extends Writable {
  private batch: T[] = [];
  private batchSize: number;
  private keyField: keyof T;
  private collection: Collection<T>;

  constructor(options: MongoBatchWritableOptions<T>) {
    super({ ...options, objectMode: true });
    this.collection = options.collection;
    this.batchSize = options.batchSize ?? 1000;
    this.keyField = options.keyField;
  }

  // Internal helper to flush batch
  private async flushBatch(): Promise<void> {
    if (this.batch.length === 0) return;
    console.log("Number of records to save: ", this.batch.length);
    const operations = this.batch.map((doc) => ({
      updateOne: {
        filter: { [this.keyField]: doc[this.keyField] } as any,
        update: { $set: doc },
        upsert: true,
      },
    }));

    this.batch = [];
    await this.collection.bulkWrite(operations, { ordered: false });
  }

  _write(chunk: T, _encoding: string, callback: (err?: Error) => void) {
    this.batch.push(chunk);

    if (this.batch.length >= this.batchSize) {
      this.flushBatch()
        .then(() => callback())
        .catch((err) => callback(err));
    } else {
      callback();
    }
  }
  _final(callback: (err?: Error) => void) {
    this.flushBatch()
      .then(() => callback())
      .catch((err) => callback(err));
  }
}
