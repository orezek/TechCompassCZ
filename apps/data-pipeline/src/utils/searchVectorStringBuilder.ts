import type {EnrichedJobRecordsSchema} from "../schemas/enrichedJobSchema/enrichedJobSchema.js";


export const searchVectorStringBuilder = (jobAd: EnrichedJobRecordsSchema) => {

  if (!jobAd.searchMetadata?.jobDescriptionCleaned)
  {
    throw new Error(`JobAd schema error: missing jobDescriptionCleaned property for jobId: ${jobAd._id}`);
  }

  const jobDescriptionCleaned = jobAd.searchMetadata?.jobDescriptionCleaned;

  const insights = jobAd.analyticalInsights;
  const coreDetails = insights?.corePositionDetails;
  const tech = insights?.technicalSkillsAndMethodologies;
  const softSkills = insights?.qualificationsAndExperience?.requiredSoftSkills;


  const searchVectorString = `
  TITLE: ${jobAd.analyticalInsights?.corePositionDetails?.jobTitle},
  FUNCTION: ${coreDetails?.jobFunction || 'N/A'}.
  SENIORITY: ${coreDetails?.seniorityLevel || 'N/A'}.
  INDUSTRY: ${coreDetails?.industryVertical || 'N/A'}.
  DOMAIN: ${coreDetails?.applicationDomain || 'N/A'}.
  
  # SKILLS AND TECHNOLOGIES
  Core Stack: ${tech?.coreTechStack}.
  Preferred Stack: ${tech?.preferredTechStack}.
  Methodologies: ${tech?.coreMethodologies}.
  Soft Skills: ${(softSkills || []).join(', ')}.
  
  # ROLE DESCRIPTION AND REQUIREMENTS
  ${jobDescriptionCleaned}
  `;
  // Normalize white space
  return searchVectorString.replace(/\s+/g, ' ');

}