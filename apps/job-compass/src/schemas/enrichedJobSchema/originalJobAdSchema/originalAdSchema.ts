import { z } from "zod";

export const originalAdSchema = z.object({
  _id: z
    .string()
    .nonempty()
    .describe("ID from MongoDB _id field for lookups and reference"),
  jobTitle: z
    .string()
    .nonempty()
    .describe("Job title as taken from staged-jobs collection"),
  companyName: z
    .string()
    .nonempty()
    .describe("CompanyName as taken from staged-jobs collection"),
  adUrl: z.string().nullable().describe("Url to the source of the ad."),
  source: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "The name of the ad source, such as jobs.cz, linkedin, startupjobs.cz",
    ),
  sourceId: z.string().describe("The id of the ad at the source."),
  date: z
    .date()
    .nullable()
    .default(null)
    .describe("The date when the job ad was published if known"),
  adValidity: z
    .boolean()
    .nullable()
    .default(null)
    .describe("Is the ad still being advertised?"),
  salaryMin: z
    .number()
    .nullable()
    .describe("Salary min as shown in the original ad under salary min."),
  salaryMax: z
    .number()
    .nullable()
    .describe("Salary max as shown in the original ad under salary max."),
  jobDescription: z
    .string()
    .nonempty()
    .describe("Raw job description as ingested from the ad."),
  benefits: z
    .string()
    .nonempty()
    .describe("Raw benefits string as ingested from the ad."),
  companyIntro: z
    .string()
    .nonempty()
    .nullable()
    .describe("Raw company info from the ad."),
  jobDetails: z
    .string()
    .nonempty()
    .nullable()
    .describe("Raw job details as ingested from the ad."),
});
