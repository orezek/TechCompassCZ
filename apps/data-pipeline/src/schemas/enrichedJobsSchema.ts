import { z } from "zod";
import { pipelineMetadataSchema } from "./observabilitySchema.js";

// Job Details Schema
export const jobDetailsSchema = z.object({
  company: z
    .object({
      name: z
        .string()
        .nullable()
        .describe(
          "The legal name of the company posting the job. Null if not provided.",
        ),
      type: z
        .enum(["employer", "agency"])
        .nullable()
        .describe(
          "The type of entity posting the job, e.g., a direct employer or a recruitment agency. Null if not specified.",
        ),
    })
    .describe("Information about the hiring company."),
  requirements: z
    .object({
      education_level: z
        .string()
        .nullable()
        .describe(
          'The minimum required level of education (e.g., "Bakalářské", "Středoškolské", "Bachelor\'s"). Null if not specified.',
        ),
      languages: z
        .array(
          z.object({
            language: z
              .string()
              .describe(
                'The name of the required language (e.g., "Čeština", "English").',
              ),
            proficiency: z
              .string()
              .describe(
                'The required level of proficiency (e.g., "Výborná", "Advanced", "Mírně pokročilá").',
              ),
          }),
        )
        .nullable()
        .describe(
          "A list of required languages and the necessary proficiency for each. Null if none are listed.",
        ),
    })
    .describe("Educational and linguistic requirements for the candidate."),
  classification: z
    .object({
      categories: z
        .array(z.string())
        .nullable()
        .describe(
          'A list of categories or tags the job is listed under (e.g., "IS/IT: Vývoj aplikací a systémů", "Programátor"). Null if not categorized.',
        ),
    })
    .describe("Industry and role classification tags."),
  contract: z
    .object({
      employment_form: z
        .string()
        .nullable()
        .describe(
          'The form of employment, typically full-time or part-time. (e.g., "Práce na plný úvazek"). Null if not specified.',
        ),
      duration: z
        .string()
        .nullable()
        .describe(
          'The duration of the employment contract (e.g., "Na dobu neurčitou", "Permanent"). Null if not specified.',
        ),
      types: z
        .array(z.string())
        .nullable()
        .describe(
          'The legal type of the contract offered (e.g., "pracovní smlouva", "práce na živnostenský list (IČO)"). Can include multiple options. Null if not specified.',
        ),
    })
    .describe("Details about the employment contract."),
  additional_info: z
    .object({
      suitability: z
        .array(z.string())
        .nullable()
        .describe(
          'A list describing candidate groups for whom the job is also suitable (e.g., "physically challenged", "graduates"). Null if not specified.',
        ),
      notes: z
        .string()
        .nullable()
        .describe(
          "Any other miscellaneous information provided in the details section. Null if no other notes are present.",
        ),
    })
    .describe("Miscellaneous details and suitability notes."),
});

// Company Intro Schema
export const companyIntroSchema = z.object({
  business_summary: z
    .string()
    .nullable()
    .describe(
      "A general summary of what the company does, its main services, and its market position. Set to null if not provided.",
    ),
  key_industries: z
    .array(z.string())
    .nullable()
    .describe(
      'A list of specific industries or sectors the company focuses on (e.g., "Real Estate", "Biotechnology", "Life Sciences"). Set to null if not mentioned.',
    ),
  corporate_values: z
    .array(z.string())
    .nullable()
    .describe(
      'A list of the company\'s stated core values or principles (e.g., "Competence", "Stability", "Ethics"). Set to null if not listed.',
    ),
  mission_statement: z
    .string()
    .nullable()
    .describe(
      "A high-level, aspirational statement about the company's ultimate goal or purpose. Set to null if not described.",
    ),
  corporate_structure: z
    .string()
    .nullable()
    .describe(
      'Information about the company\'s structure, such as being part of a larger group, a subsidiary, or its organizational model (e.g., "matrix organization"). Set to null if not mentioned.',
    ),
  social_responsibility: z
    .string()
    .nullable()
    .describe(
      "A description of the company's philanthropic efforts, foundations, or social initiatives. Set to null if not mentioned.",
    ),
  local_focus: z
    .string()
    .nullable()
    .describe(
      'Specific activities, specializations, or history related to the local branch or office (e.g., "In Prague, we specialize in..."). Set to null if not applicable.',
    ),
  work_culture_summary: z
    .string()
    .nullable()
    .describe(
      "A description of the work environment, team dynamics, and atmosphere. Note: This may overlap with benefits but is often part of the company identity. Set to null if not described.",
    ),
  website_url: z
    .string()
    .url()
    .nullable()
    .describe(
      "The company's official website URL, if mentioned in the text. Set to null if not provided.",
    ),
  address: z
    .string()
    .nullable()
    .describe(
      "The physical address of the company, if provided in this section. Set to null if not listed.",
    ),
});

// Job Description Schema
export const jobDescriptionSchema = z.object({
  language: z
    .enum(["cs", "en"])
    .describe(
      'The primary language of the job description text (e.g., "cs" for Czech, "en" for English).',
    ),
  industry: z
    .string()
    .describe(
      'The primary business sector or field the company operates in (e.g., "Kybernetická bezpečnost", "Non-profit").',
    ),
  companyProfile: z
    .string()
    .nullable()
    .describe(
      "A summary of the company’s mission, values, culture, and market position. Set to null if not provided.",
    ),
  jobMission: z
    .string()
    .nullable()
    .describe(
      "A high-level summary of the role’s purpose and its impact on the company or its clients. Set to null if not described.",
    ),
  companyTechStack: z
    .array(z.string())
    .nullable()
    .describe(
      "A list of key technologies, software, platforms, and tools used by the company. Set to null if none are mentioned.",
    ),
  responsibilities: z
    .array(z.string())
    .describe(
      "A list of the main tasks, duties, and day-to-day activities for the role.",
    ),
  locationAndTravel: z
    .object({
      officeLocation: z
        .string()
        .nullable()
        .describe(
          "The physical address or city of the office. Set to null if not mentioned.",
        ),
      remotePolicy: z
        .string()
        .nullable()
        .describe(
          'The company’s policy on remote work (e.g., "Flexible", "Hybrid", "Fully Remote"). Set to null if not specified.',
        ),
      travelRequirements: z
        .string()
        .nullable()
        .describe(
          "Details about any required business travel. Set to null if travel is not mentioned.",
        ),
    })
    .nullable()
    .describe(
      "Information regarding the work location and travel. Set to null if no relevant information is provided.",
    ),
  workArrangement: z
    .object({
      contractType: z
        .string()
        .nullable()
        .describe(
          'The type of employment contract (e.g., "Permanent", "Fixed-term"). Set to null if not specified.',
        ),
      workload: z
        .string()
        .nullable()
        .describe(
          'The expected workload (e.g., "Full-time", "Part-time 0.6 FTE"). Set to null if not specified.',
        ),
      employmentModel: z
        .string()
        .nullable()
        .describe(
          'The legal form of employment (e.g., "Employee", "Freelance/Contractor"). Set to null if not specified.',
        ),
      startDate: z
        .string()
        .nullable()
        .describe(
          "The ideal or expected start date for the position. Set to null if not specified.",
        ),
    })
    .nullable()
    .describe(
      "Details about the employment contract and schedule. Set to null if no relevant information is provided.",
    ),
  requiredSkills: z
    .object({
      mustHave: z
        .array(z.string())
        .describe(
          "A list of essential, non-negotiable skills, qualifications, or years of experience required for the role.",
        ),
      niceToHave: z
        .array(z.string())
        .nullable()
        .describe(
          "A list of advantageous but not strictly required skills or qualifications. Set to null if none are listed.",
        ),
    })
    .describe("The required technical and soft skills for the candidate."),
  seniorityLevel: z
    .enum([
      "intern",
      "junior",
      "medior",
      "senior",
      "lead",
      "manager",
      "executive",
    ])
    .nullable()
    .default(null)
    .describe(
      "The standardized seniority level deduced from the job description and requirements.",
    ),
  candidateProfile: z
    .array(z.string())
    .describe(
      'A list of desired personality traits, work styles, and soft skills (e.g., "Team player", "Proactive attitude").',
    ),
  compensationAndBenefits: z
    .object({
      salary: z
        .string()
        .nullable()
        .describe(
          'The salary or salary range for the position (e.g., "80-130 tis. Kč/měsíc"). Set to null if not provided.',
        ),
      vacation: z
        .string()
        .nullable()
        .describe(
          'The amount of paid vacation days or weeks offered (e.g., "5 týdnů", "25 dní"). Set to null if not mentioned.',
        ),
      otherBenefits: z
        .array(z.string())
        .nullable()
        .describe(
          'A list of other perks, benefits, and compensation offered (e.g., "Multisport card", "Home office allowance"). Set to null if none are listed.',
        ),
    })
    .describe("The complete compensation and benefits package."),
});

// Main enriched jobs schema
const enrichedJobSchemaBase = z.object({
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
  searchVector: z
    .string()
    .nullable()
    .default(null)
    .describe("String specifically crafted for semantic search."),
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
  jobDescriptionParsed: jobDescriptionSchema
    .nullable()
    .default(null)
    .describe(
      "Information extracted, deduced and discerned from job description.",
    ),
  companyIntroParsed: companyIntroSchema
    .nullable()
    .default(null)
    .describe("Extracted information from often missing company introduction."),
  contactParsed: z
    .object({
      name: z
        .string()
        .nullable()
        .describe(
          "The full name of the primary contact person for the job application. Set to null if not specified.",
        ),
      phoneNumber: z
        .string()
        .nullable()
        .describe(
          "The contact phone number for inquiries. Set to null if not provided.",
        ),
    })
    .nullable()
    .default(null)
    .describe("Contact as given from the contact field in the add."),
  locationParsed: z
    .object({
      full_address: z
        .string()
        .nullable()
        .describe(
          "The complete, original address string as it appears in the advertisement.",
        ),
      city: z
        .string()
        .nullable()
        .describe(
          'The city name (e.g., "Praha"). Set to null if not specified.',
        ),
      district: z
        .string()
        .nullable()
        .describe(
          'The city district or neighborhood (e.g., "Karlín", "Staré Město", "Křeslice"). Set to null if not specified.',
        ),
      street: z
        .string()
        .nullable()
        .describe("The street name. Set to null if not provided."),
      street_number: z
        .string()
        .nullable()
        .describe(
          'The street or building number, which may include a slash (e.g., "658/34"). Set to null if not provided.',
        ),
    })
    .nullable()
    .default(null)
    .describe("Location from the main ad page."),
  jobDetailsParsed: jobDetailsSchema
    .nullable()
    .default(null)
    .describe(
      "Extracted job details from the ad job details sections into categories.",
    ),
});

export type EnrichedJobSchema = z.infer<typeof enrichedJobSchema>;

//
export const enrichedJobSchema = enrichedJobSchemaBase.extend({
  _pipelineMetadata: pipelineMetadataSchema
    .nullable()
    .default(null)
    .describe("Metadata for observability processing."),
});
