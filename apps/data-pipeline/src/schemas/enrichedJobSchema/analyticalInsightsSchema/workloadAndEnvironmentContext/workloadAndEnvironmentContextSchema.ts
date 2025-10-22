import { z } from "zod";
// =================================================================
// 10. Workload and Environment Context (Inferred)
// =================================================================

// Enum Definitions

const WorkLifeBalanceSignalEnum = z.enum([
  "Actively Promoted (Exceptional Benefits)",
  "Standard/Varies by Role",
  "Demanding/High Commitment Expected",
]);

const ProjectFocusTypeEnum = z.enum([
  "Greenfield (New Development/Build)",
  "Brownfield (Maintenance/Improvement)",
  "Mixed",
]);

const TechnologyMaturityEnum = z.enum([
  "Cutting-Edge/Emerging (e.g., AI/ML focus)",
  "Modern Cloud/DevOps",
  "Stable/Established Platform",
  "Legacy/Maintenance Heavy",
]);

const RegulatoryEnvironmentEnum = z.enum([
  "Highly Regulated (Finance, Defense, Government)",
  "Standard Compliance (GDPR, IT Standards)",
  "Low Regulation",
]);

// Schema Definition
export const workloadAndEnvironmentContextSchema = z.object({
  workLifeBalanceSignal: WorkLifeBalanceSignalEnum.nullable()
    .default(null)
    .describe(
      "Definition: Assesses the likely reality of work-life balance, inferred by contrasting offered flexibility with the demands and nature of the role. Inference Guide (Psychologist/Recruiter View): Synthesize benefits and responsibilities. 'Actively Promoted' is signaled by exceptional benefits like 'Neomezenou dovolenou' (Unlimited vacation). CRITICAL: 'Demanding' is indicated by explicit requirements like '24/7 oncall support', 'směnném provozu 24/7' (24/7 shift work), or significant travel ('50 - 80 % pracovního času'), regardless of stated flexibility.",
    ),
  projectFocusType: ProjectFocusTypeEnum.nullable()
    .default(null)
    .describe(
      "Definition: Distinguishes the primary focus of the work: developing new solutions versus maintaining or improving existing systems. Inference Guide (Data Extraction/Recruiter View): 'Greenfield' is indicated by phrases like 'Rozjezd zcela nového projektu' (Start of a completely new project) or 'Vývoj zcela nového systému'. 'Brownfield' is suggested by roles focused heavily on 'Správa systémů' (System administration), 'support', or 'optimalizace' (optimization) of existing infrastructure. Roles involving both 'Implementace' and 'Správa' are 'Mixed'.",
    ),
  technologyMaturity: TechnologyMaturityEnum.nullable()
    .default(null)
    .describe(
      "Definition: The inferred state of the technology stack and infrastructure the role will interact with. Inference Guide (Data Extraction/Recruiter View): Inferred from the technologies listed and the nature of the work. Roles focused on 'AI projekt' suggest 'Cutting-Edge/Emerging'. Emphasis on 'moderních cloudových technologiích', 'Azure', or 'Kubernetes' points to 'Modern Cloud/DevOps'. Mentions of 'Vyhrazený čas na inovace' (Dedicated time for innovation) also indicate a modern approach.",
    ),
  regulatoryEnvironment: RegulatoryEnvironmentEnum.nullable()
    .default(null)
    .describe(
      "Definition: The level of external regulation and compliance requirements the role or company operates under. Inference Guide (Recruiter/Data Extraction View): Inferred from the industry sector and specific compliance mentions. 'regulatorních požadavcích platných pro finanční instituce' (regulatory requirements for financial institutions), 'DEFENSE sektoru', or 'státní správy' (government administration) indicate 'Highly Regulated'. Most general IT roles fall under 'Standard Compliance'.",
    ),
});
