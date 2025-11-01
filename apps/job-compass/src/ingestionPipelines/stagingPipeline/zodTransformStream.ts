import { Transform } from 'stream';
import { z, ZodType } from "zod";

export function createZodValidatorStream<T extends ZodType>(zodSchema: T): Transform {
  return new Transform({
    objectMode: true,
    transform(rowObject, encoding, callback: (err?: Error, data?: z.infer<T>) => void) {
      const validatedData = zodSchema.safeParse(rowObject);
      if (validatedData.success) {
        this.push(validatedData.data);
        callback();
      } else {
        const fieldErrors = validatedData.error.message.toString();
        console.warn("Invalid error", fieldErrors);
      }
    }
  });
}
