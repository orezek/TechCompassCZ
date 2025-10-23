import * as dotenv from 'dotenv';
import { connectToDb, client } from "../mongoConnectionDb.js";
import { type EnrichedJobRecordsSchema } from "../schemas/enrichedJobSchema/enrichedJobSchema.js";
import {extractTechnicalSkillsAndMethodologies} from "../chains/technicalSkillsAndMethodologiesExtraction.js";
import {extractCorePositionAndDetails} from "../chains/corePositionDetailsExtraction.js";
import {extractBenefitsAndPerks} from "../chains/benefitsAndPerksExtraction.js";
import { extractCareerDevelopmentAndRecruitment } from "./../chains/careerDevelopmentAndRecruitmentExtraction.js"
import type {AnyBulkWriteOperation} from "mongodb";
import {extractCompanyAndTeamContext} from "../chains/companyAndTeamContextExtraction.js";
import {extractCompensationAndFinancials} from "../chains/compensationAndFinancialsExtraction.js";
import {extractContractualDetails} from "../chains/contractualDetailsExtraction.js";
import {extractCulturalAndPsychologicalIndicators} from "../chains/culturalAndPsychologicalIndicators.js";
import {extractLocationAndWorkModel} from "../chains/locationAndWorkModelExtraction.js";
import {extractQualificationAndExperience} from "../chains/qualificationAndExperienceExtraction.js";
import {extractWorkloadAndEnvironmentContext} from "../chains/workloadAndEnvironmentExtraction.js";
dotenv.config();

await connectToDb();
const db = client.db('it-jobs');
const enrichedJobsCollection = db.collection<EnrichedJobRecordsSchema>("enriched-job-records");

const BATCH_SIZE = 3;
let bulkWriteOperations: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];

async function processStagedJobs() {
  const enrichedJobs = enrichedJobsCollection.find({});
  for await (const enrichedJob of enrichedJobs) {
    const extractedCorePosition = await extractCorePositionAndDetails(JSON.stringify(enrichedJob.originalAdData));
    const extractedTechnicalSkills = await extractTechnicalSkillsAndMethodologies(JSON.stringify(enrichedJob.originalAdData));
    const extractedBenefitsAndPerks = await extractBenefitsAndPerks(JSON.stringify(enrichedJob.originalAdData));
    const extractedCareerDevelopmentAndRecruitment = await extractCareerDevelopmentAndRecruitment(JSON.stringify(enrichedJob.originalAdData));
    const extractedCompanyAndTeamContext = await extractCompanyAndTeamContext(JSON.stringify(enrichedJob.originalAdData));
    const extractedCompensationAndFinancials = await extractCompensationAndFinancials(JSON.stringify(enrichedJob.originalAdData));
    const extractedContractualDetails = await extractContractualDetails(JSON.stringify(enrichedJob.originalAdData));
    const extractedCulturalAndPsychologicalIndicators = await extractCulturalAndPsychologicalIndicators(JSON.stringify(enrichedJob.originalAdData));
    const extractedLocationAndWorkModel = await extractLocationAndWorkModel(JSON.stringify(enrichedJob.originalAdData));
    const extractedQualificationAndExperience = await  extractQualificationAndExperience(JSON.stringify(enrichedJob.originalAdData));
    const extractedWorkloadAndEnvironmentContext = await extractWorkloadAndEnvironmentContext(JSON.stringify(enrichedJob.originalAdData));

    bulkWriteOperations.push({
      updateOne: {
        filter: {_id: enrichedJob._id},
        update: {
          $set: {
            "analyticalInsights.corePositionDetails": extractedCorePosition,
            "analyticalInsights.technicalSkillsAndMethodologies": extractedTechnicalSkills,
            "analyticalInsights.benefitsAndPerks": extractedBenefitsAndPerks,
            "analyticalInsights.careerDevelopmentAndRecruitment": extractedCareerDevelopmentAndRecruitment,
            "analyticalInsights.companyAndTeamContext": extractedCompanyAndTeamContext,
            "analyticalInsights.compensationAndFinancials": extractedCompensationAndFinancials,
            "analyticalInsights.contractulDetails": extractedContractualDetails,
            "analyticalInsights.culturalAndPsychologicalIndicators": extractedCulturalAndPsychologicalIndicators,
            "analyticalInsights.locationAndWorkModel": extractedLocationAndWorkModel,
            "analyticalInsights.qualificationAndExperience": extractedQualificationAndExperience,
            "analyticalInsights.WorkloadAndEnvironmentContext": extractedWorkloadAndEnvironmentContext
          }
        }
      }
    })

    if (bulkWriteOperations.length >= BATCH_SIZE) {
      console.log(`Writing batch of ${bulkWriteOperations.length} records.`);
      await enrichedJobsCollection.bulkWrite(bulkWriteOperations);
      bulkWriteOperations = [];
    }
  }
  if (bulkWriteOperations.length > 0) {
    console.log(`Writing the final batch of ${bulkWriteOperations.length} records.`);
    await enrichedJobsCollection.bulkWrite(bulkWriteOperations);
  }

}

try {
  await processStagedJobs();
}
catch (e) {
  console.error(e);
}
finally {
  await client.close()
}




