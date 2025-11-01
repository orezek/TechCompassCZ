import * as dotenv from "dotenv";
import {
  closeLocalMongoInstance,
  getLocalEnrichedJobRecordsCollection, getLocalStagedJobRecordsCollection,
} from "../mongoConnectionDb.js";
import { type EnrichedJobRecordsSchema } from "../schemas/enrichedJobSchema/enrichedJobSchema.js";
import { extractTechnicalSkillsAndMethodologies } from "../chains/dataEnrichment/technicalSkillsAndMethodologiesExtraction.js";
import { extractCorePositionAndDetails } from "../chains/dataEnrichment/corePositionDetailsExtraction.js";
import { extractBenefitsAndPerks } from "../chains/dataEnrichment/benefitsAndPerksExtraction.js";
import { extractCareerDevelopmentAndRecruitment } from "../chains/dataEnrichment/careerDevelopmentAndRecruitmentExtraction.js";
import type { AnyBulkWriteOperation } from "mongodb";
import { extractCompanyAndTeamContext } from "../chains/dataEnrichment/companyAndTeamContextExtraction.js";
import { extractCompensationAndFinancials } from "../chains/dataEnrichment/compensationAndFinancialsExtraction.js";
import { extractContractualDetails } from "../chains/dataEnrichment/contractualDetailsExtraction.js";
import { extractCulturalAndPsychologicalIndicators } from "../chains/dataEnrichment/culturalAndPsychologicalIndicators.js";
import { extractLocationAndWorkModel } from "../chains/dataEnrichment/locationAndWorkModelExtraction.js";
import { extractQualificationAndExperience } from "../chains/dataEnrichment/qualificationAndExperienceExtraction.js";
import { extractWorkloadAndEnvironmentContext } from "../chains/dataEnrichment/workloadAndEnvironmentExtraction.js";

dotenv.config();

const enrichedJobsCollection = await getLocalEnrichedJobRecordsCollection();
const stagedJobsCollection = await getLocalStagedJobRecordsCollection();
const BATCH_SIZE = 100;
let bulkWriteOperations: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];
let apiCounter = 0;
async function enrichJobRecords() {
  if (enrichedJobsCollection && stagedJobsCollection) {
    const enrichedJobs = enrichedJobsCollection.find({});
    // const stagedJobs = stagedJobsCollection.find({});
    for await (const enrichedJob of enrichedJobs) {
      console.log(`Working on: ${enrichedJob.originalAdData?.jobTitle}`);
      const [
        extractedCorePosition,
        extractedTechnicalSkills,
        extractedBenefitsAndPerks,
        extractedCareerDevelopmentAndRecruitment,
        extractedCompanyAndTeamContext,
        extractedCompensationAndFinancials,
        extractedContractualDetails,
        extractedCulturalAndPsychologicalIndicators,
        extractedLocationAndWorkModel,
        extractedQualificationAndExperience,
        extractedWorkloadAndEnvironmentContext,
      ] = await Promise.all([
        extractCorePositionAndDetails(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractTechnicalSkillsAndMethodologies(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractBenefitsAndPerks(JSON.stringify(enrichedJob.originalAdData)),
        extractCareerDevelopmentAndRecruitment(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractCompanyAndTeamContext(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractCompensationAndFinancials(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractContractualDetails(JSON.stringify(enrichedJob.originalAdData)),
        extractCulturalAndPsychologicalIndicators(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractLocationAndWorkModel(JSON.stringify(enrichedJob.originalAdData)),
        extractQualificationAndExperience(
          JSON.stringify(enrichedJob.originalAdData),
        ),
        extractWorkloadAndEnvironmentContext(
          JSON.stringify(enrichedJob.originalAdData),
        ),
      ]);
      apiCounter += 11;
      console.log(`API call count: ${apiCounter}`);
      console.log(
        `All data extracted for job: ${enrichedJob.originalAdData?.jobTitle}`,
      );
      bulkWriteOperations.push({
        updateOne: {
          filter: { _id: enrichedJob._id },
          update: {
            $set: {
              "analyticalInsights.corePositionDetails": extractedCorePosition,
              "analyticalInsights.technicalSkillsAndMethodologies":
                extractedTechnicalSkills,
              "analyticalInsights.benefitsAndPerks": extractedBenefitsAndPerks,
              "analyticalInsights.careerDevelopmentAndRecruitment":
                extractedCareerDevelopmentAndRecruitment,
              "analyticalInsights.companyAndTeamContext":
                extractedCompanyAndTeamContext,
              "analyticalInsights.compensationAndFinancials":
                extractedCompensationAndFinancials,
              "analyticalInsights.contractulDetails":
                extractedContractualDetails,
              "analyticalInsights.culturalAndPsychologicalIndicators":
                extractedCulturalAndPsychologicalIndicators,
              "analyticalInsights.locationAndWorkModel":
                extractedLocationAndWorkModel,
              "analyticalInsights.qualificationAndExperience":
                extractedQualificationAndExperience,
              "analyticalInsights.WorkloadAndEnvironmentContext":
                extractedWorkloadAndEnvironmentContext,
            },
          },
        },
      });

      if (bulkWriteOperations.length >= BATCH_SIZE) {
        console.log(`Writing batch of ${bulkWriteOperations.length} records.`);
        await enrichedJobsCollection.bulkWrite(bulkWriteOperations);
        bulkWriteOperations = [];
      }
    }
    if (bulkWriteOperations.length > 0) {
      console.log(
        `Writing the final batch of ${bulkWriteOperations.length} records.`,
      );
      await enrichedJobsCollection.bulkWrite(bulkWriteOperations);
    }
  } else {
    throw new Error("Failed to connect to enriched-job-records collection.");
  }
}

try {
  await enrichJobRecords();
} catch (e) {
  console.error(e);
} finally {
  await closeLocalMongoInstance();
}
