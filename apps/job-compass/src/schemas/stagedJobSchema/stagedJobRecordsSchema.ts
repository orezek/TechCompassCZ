import { z } from "zod";
import { ObjectId } from "mongodb";

export const stagedJobRecordsSchema = z.object({
  _id: z.instanceof(ObjectId).optional().describe("Unique MongoDB ID assigned by Mongo."),
  jobTitle: z.string().min(1, { message: "JobTitle cannot be empty" }).describe("Ad job title as taken from the ad."),
  companyName: z.string().min(1, { message: "Company cannot be empty" }).describe("The name of the company tha is searching for an employee/freelancer."),
  adUrl: z.preprocess((val) => {
    if (!val) {
      return null;
    }
    return val;
  }, z.url().nullable()).describe("The original URL of the ad source."),
  sourceId: z.string().min(1, { message: "sourceId cannot be empty" }).describe("Unique id as taken from the source."),
  jobDescription: z
    .string()
    .min(1, { message: "Job description cannot be empty" }).describe("Full text job description."),
  salaryMin: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().nullable().optional().describe("Value provided on the ad page, may be often empty."),
  ),
  salaryMax: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().nullable().optional().describe("Value provided on the ad page, may be often empty."),
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
  }, z.coerce.date().nullable()).describe("The date when the job ad was published ont the source page."),
  source: z.string().min(1, { message: "Source cannot be empty" }).describe("The name of the publishing server"),

  contact: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ).describe("Recruiter contact or person who can answer questions regarding the ad."),
  jobDetails: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional(),
  ).describe("Additional details about the job as published on the publishing server."),
  companyIntro: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional().describe("General information about the company that is searching for an employee/freelancer."),
  ),
  benefits: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional().describe("Benefits and perks list as published on the ad server."),
  ),
  location: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.string().nullable().optional().describe("The place, address, city of the company residence."),
  ),
  ingestionDate: z.preprocess(() => {
    return new Date();
  }, z.date()).describe("The date the ad was ingested."),
});

export type StagedJobRecordsSchema = z.infer<typeof stagedJobRecordsSchema>;
