import {
  stagedJobSchema,
  // type StagedJobSchema,
} from "./schemas/stagedJobSchema.js";
import {
  enrichedJobSchema,
  // type EnrichedJobSchema,
} from "./schemas/enrichedJobsSchema.js";

const testObj = {
  jobTitle: "Senior Frontend Developer",
  companyName: "Quantum Innovations Inc.",
  adUrl: "https://jobs.quantuminnovations.com/position/8a7d6f5e",
  sourceId: "linkedin-qtm-sfd-5923",
  jobDescription:
    "We are seeking a talented Senior Frontend Developer to lead the development of our next-generation user interfaces. You will work with a modern tech stack including React, TypeScript, and GraphQL to build scalable and performant web applications.",
  salaryMin: 95000,
  salaryMax: 130000,
  date: "2025-10-01T09:00:00.000Z",
  source: "LinkedIn",
  contact:
    "Jane Doe, Talent Acquisition Lead (jane.doe@quantuminnovations.com)",
  jobDetails:
    "Key Responsibilities: Architect and implement user-facing features. Optimize components for maximum performance across a vast array of web-capable devices and browsers. Collaborate with product managers and UI/UX designers to translate concepts into functional requirements.",
  companyIntro:
    "Quantum Innovations Inc. is a leading provider of cutting-edge AI-driven analytics solutions, empowering businesses to make smarter decisions.",
  benefits:
    "Comprehensive health, dental, and vision insurance; 401(k) with company match; Flexible work hours and remote options; Generous paid time off.",
  location: "Prague, Czechia",
  ingestionDate: "2025-10-15T10:19:47.123Z",
};

const stagedJobObjParsed = stagedJobSchema.safeParse(testObj);

const enrichedJobObjParsed = enrichedJobSchema.safeParse(
  stagedJobObjParsed.data,
);

console.log("Parsed objects");
console.log(stagedJobObjParsed.data);
console.log("------------------");
console.log(enrichedJobObjParsed.data);
