import { z } from 'zod';

import { benefitsAndPerksSchema} from "./benefitsAndPerks/benefitsAndPerksSchema.js";
import { careerDevelopmentAndRecruitmentInsightsSchema} from "./careerDevelopmentAndRecruitmentInsights/careerDevelopmentAndRecruitmentInsightsSchema.js";
import { companyAndTeamContextSchema } from "./companyAndTeamContext/companyAndTeamContextSchema.js";
import { contractualDetailsSchema } from "./contractualDetails/contractualDetailsSchema.js";
import { corePositionDetailsSchema } from './corePositionDetails/corePositionDetailsSchema.js';
import { locationAndWorkModelSchema } from "./locationAndWorkModel/locationAndWorkModelSchema.js";
import { compensationAndFinancialsSchema } from "./compensationAndFinancials/compensationAndFinancialsSchema.js";
import { technicalSkillsAndMethodologiesSchema } from "./technicalSkillsAndMethodologies/technicalSkillAndMethodologiesSchema.js";
import { qualificationsAndExperienceSchema } from "./qualificationAndExperience/qualificationAndExperienceSchema.js";
import { culturalAndPsychologicalIndicatorsSchema } from "./culturalAndPsychologicalIndicators/culturalAndPsychologicalIndicatorsSchema.js";
import { workloadAndEnvironmentContextSchema } from "./workloadAndEnvironmentContext/workloadAndEnvironmentContextSchema.js";

export const analyticalInsightsSchema = z.object({
  // Extracted and Normalized
  corePositionDetails: corePositionDetailsSchema.nullable().default(null),
  locationAndWorkModel: locationAndWorkModelSchema.nullable().default(null),
  compensationAndFinancials: compensationAndFinancialsSchema.nullable().default(null),
  benefitsAndPerks: benefitsAndPerksSchema.nullable().default(null),
  contractualDetails: contractualDetailsSchema.nullable().default(null),
  technicalSkillsAndMethodologies: technicalSkillsAndMethodologiesSchema.nullable().default(null),
  qualificationsAndExperience: qualificationsAndExperienceSchema.nullable().default(null),
  companyAndTeamContext: companyAndTeamContextSchema.nullable().default(null),
  // Inferred Insights
  culturalAndPsychologicalIndicators: culturalAndPsychologicalIndicatorsSchema.nullable().default(null),
  workloadAndEnvironmentContext: workloadAndEnvironmentContextSchema.nullable().default(null),
  careerDevelopmentAndRecruitmentInsights: careerDevelopmentAndRecruitmentInsightsSchema.nullable().default(null),
});
