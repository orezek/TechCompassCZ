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

const BATCH_SIZE = 100;
let bulkWriteOperations: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];
let apiCounter = 0;
async function processStagedJobs() {
  const enrichedJobs = enrichedJobsCollection.find({});
  for await (const enrichedJob of enrichedJobs) {
    apiCounter++;
    console.log(`Working on: ${enrichedJob.originalAdData?.jobTitle}`);
    console.log("1");
    const extractedCorePosition = await extractCorePositionAndDetails(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("2");
    const extractedTechnicalSkills = await extractTechnicalSkillsAndMethodologies(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("3");
    const extractedBenefitsAndPerks = await extractBenefitsAndPerks(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("4");
    const extractedCareerDevelopmentAndRecruitment = await extractCareerDevelopmentAndRecruitment(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("5");
    const extractedCompanyAndTeamContext = await extractCompanyAndTeamContext(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("6");
    const extractedCompensationAndFinancials = await extractCompensationAndFinancials(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("7");
    const extractedContractualDetails = await extractContractualDetails(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("8");
    const extractedCulturalAndPsychologicalIndicators = await extractCulturalAndPsychologicalIndicators(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("9");
    const extractedLocationAndWorkModel = await extractLocationAndWorkModel(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("10");
    const extractedQualificationAndExperience = await  extractQualificationAndExperience(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("11");
    const extractedWorkloadAndEnvironmentContext = await extractWorkloadAndEnvironmentContext(JSON.stringify(enrichedJob.originalAdData));
    apiCounter++
    console.log("12");
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





// For handling promises in parallel.
// const geminiApiCalls = [
//   extractCorePositionAndDetails(JSON.stringify(enrichedJob.originalAdData)),
//   extractTechnicalSkillsAndMethodologies(JSON.stringify(enrichedJob.originalAdData)),
//   extractBenefitsAndPerks(JSON.stringify(enrichedJob.originalAdData)),
//   extractCareerDevelopmentAndRecruitment(JSON.stringify(enrichedJob.originalAdData)),
//   extractCompanyAndTeamContext(JSON.stringify(enrichedJob.originalAdData)),
//   extractCompensationAndFinancials(JSON.stringify(enrichedJob.originalAdData)),
//   extractContractualDetails(JSON.stringify(enrichedJob.originalAdData)),
//   extractCulturalAndPsychologicalIndicators(JSON.stringify(enrichedJob.originalAdData)),
//   extractCulturalAndPsychologicalIndicators(JSON.stringify(enrichedJob.originalAdData)),
//   extractLocationAndWorkModel(JSON.stringify(enrichedJob.originalAdData)),
//   extractQualificationAndExperience(JSON.stringify(enrichedJob.originalAdData)),
//   extractWorkloadAndEnvironmentContext(JSON.stringify(enrichedJob.originalAdData))
// ];