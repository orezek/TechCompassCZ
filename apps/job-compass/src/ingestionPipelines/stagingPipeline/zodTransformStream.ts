import { Transform } from "stream";
import { z, ZodType } from "zod";

let validCounter = 0;
let errorCounter = 0;

export function createZodValidatorStream<T extends ZodType>(zodSchema: T): Transform {
  return new Transform({
    objectMode: true,
    transform( rowObject, encoding, callback: (err?: Error, data?: z.infer<T>) => void) {
      const validatedData = zodSchema.safeParse(rowObject);
      if (validatedData.success) {
        console.log(`Valid objects: ${++validCounter}`)
        this.push(validatedData.data);
        callback();
      } else {
        console.error(`Invalid objects: ${++errorCounter}`)
        const fieldErrors = validatedData.error.message.toString();
        console.warn("Invalid error", fieldErrors);
        callback();
      }
    },
    flush(callback) {
      console.log(`Validation complete — valid: ${validCounter}, invalid: ${errorCounter}`
      );
      callback();
    },
  });
}
