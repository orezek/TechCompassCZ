import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
// For the csv to json parsing and validation
export const stagedJobSchema = z.object({
  _id: z
    .string()
    .default(() => uuidv4())
    .describe("Unique ID for the object."),
  jobTitle: z.string().min(1, { message: "JobTitle cannot be empty" }),
  companyName: z.string().min(1, { message: "Company cannot be empty" }),
  adUrl: z.preprocess((val) => {
    if (!val) {
      return null;
    }
    return val;
  }, z.url().nullable()),
  sourceId: z.string().min(1, { message: "sourceId cannot be empty" }),
  jobDescription: z
    .string()
    .min(1, { message: "Job description cannot be empty" }),
  salaryMin: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().nullable().optional(),
  ),
  salaryMax: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().nullable().optional(),
  ),
  date: z.preprocess((val) => {
    if (!val) {
      return null;
    }
    const parseDate = new Date(val as string);
    if (isNaN(parseDate.getTime())) {
      return null;
    }
    return val;
  }, z.coerce.date().nullable()),
  source: z.string().min(1, { message: "Source cannot be empty" }),
  // corresponds to contactParsed in enriched_jobs collection
  contact: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ),
  // corresponds to jobDetailsParsed in enriched_jobs collection
  jobDetails: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ),
  // corresponds to companyIntro in enriched_jobs collection
  companyIntro: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ),
  // corresponds to benefitsParsed in enriched_jobs collection
  benefits: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ),
  // corresponds to locationParsed in enriched_jobs collection
  location: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ),
  ingestionDate: z.preprocess(() => {
    return new Date();
  }, z.date()),
});

export type StagedJobSchema = z.infer<typeof stagedJobSchema>;
