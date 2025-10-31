import { Transform } from 'stream';
import { z, ZodType } from "zod";

/**
 * A factory function that creates a Transform stream
 * to validate (and optionally transform) objects using a Zod schema.
 */

export function createZodValidatorStream<T extends ZodType>(zodSchema: T): Transform {
  return new Transform({
    objectMode: true,
    transform(rowObject, encoding, callback) {
      const validatedData = zodSchema.safeParse(rowObject);
      if (validatedData.success) {
        console.log(validatedData);
        callback(null, validatedData.data as z.infer<T>);
      } else {
        const fieldErrors = validatedData.error.message.toString();
        console.warn(`Row error: ${fieldErrors}`);
        callback(null);
      }
    }
  });
}