import * as z from 'zod';
import { ObjectId } from 'mongodb'

export const searchJobSchema = z.object({
  pageContent: z.string().describe("The text that will be embedded in the embedding field."),
  embedding: z.array(z.number()).describe("Embedding vector"),
  metadata: z.object({
      parentId: z.instanceof(ObjectId).describe("The ObjectId of the parent enriched-job-record document."),
      // language: z.string().describe("Job posting language."),
      employmentType: z.string().describe("Employment type from contract details."),
      contractType: z.string().describe("Type of contract (e.g., HPP Employee Contract)."),
      contractDuration: z.string().describe("Duration of the contract (e.g., Permanent)."),
      workModel: z.string().describe("Work arrangement (e.g., Hybrid-office-first)."),
      companySize: z.string().describe("Size of the company."),
      companyType: z.string().describe("Type of company."),
      teamSize: z.string().describe("Size of the team."),
      //workLifeBalanceSignal: z.string().describe("Workload / life balance signal from analytical insights."),
      technologyMaturity: z.string().describe("Maturity level of technology used."),
      //careerTrajectoryType: z.string().describe("Career path associated with the position."),
      // requirementFlexibility: z.string().describe("Flexibility of requirements for the role."),
      // companyCultureArchetype: z.string().describe("Culture archetype of the company."),
      autonomyLevel: z.string().describe("Autonomy level for the role."),
      // managementStyleAndHierarchy: z.string().describe("Management style and hierarchy."),
      seniorityLevel: z.string().describe("The level of experience the candidate should have"),
      industryVertical: z.string().describe("The industry the company is in."),
  })
})

export type SearchJobSchema = z.infer<typeof searchJobSchema>;