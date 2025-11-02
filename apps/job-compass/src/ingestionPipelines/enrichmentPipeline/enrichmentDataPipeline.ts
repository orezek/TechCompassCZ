import * as dotenv from "dotenv";
import {
  closeLocalMongoInstance,
  getLocalEnrichedJobRecordsCollection,
  getLocalStagedJobRecordsCollection,
  getCloudEnrichedJobRecordsCollection,
  getCloudStageJobRecordsCollection, closeCloudMongoInstance
} from "../../mongoConnectionDb.js";
import { type EnrichedJobRecordsSchema } from "../../schemas/enrichedJobSchema/enrichedJobSchema.js";
import { extractTechnicalSkillsAndMethodologies } from "../../chains/dataEnrichment/technicalSkillsAndMethodologiesExtraction.js";
import { extractCorePositionAndDetails } from "../../chains/dataEnrichment/corePositionDetailsExtraction.js";
import { extractBenefitsAndPerks } from "../../chains/dataEnrichment/benefitsAndPerksExtraction.js";
import { extractCareerDevelopmentAndRecruitment } from "../../chains/dataEnrichment/careerDevelopmentAndRecruitmentExtraction.js";
import type { AnyBulkWriteOperation } from "mongodb";
import { extractCompanyAndTeamContext } from "../../chains/dataEnrichment/companyAndTeamContextExtraction.js";
import { extractCompensationAndFinancials } from "../../chains/dataEnrichment/compensationAndFinancialsExtraction.js";
import { extractContractualDetails } from "../../chains/dataEnrichment/contractualDetailsExtraction.js";
import { extractCulturalAndPsychologicalIndicators } from "../../chains/dataEnrichment/culturalAndPsychologicalIndicators.js";
import { extractLocationAndWorkModel } from "../../chains/dataEnrichment/locationAndWorkModelExtraction.js";
import { extractQualificationAndExperience } from "../../chains/dataEnrichment/qualificationAndExperienceExtraction.js";
import { extractWorkloadAndEnvironmentContext } from "../../chains/dataEnrichment/workloadAndEnvironmentExtraction.js";

dotenv.config();

const enrichedJobsCollection = await getLocalEnrichedJobRecordsCollection();
const stagedJobsCollection = await getLocalStagedJobRecordsCollection();
const enrichedCloudJobsCollection = await getCloudEnrichedJobRecordsCollection();
const stagedCloudJobsCollection = await getCloudStageJobRecordsCollection();


const BATCH_SIZE = 1;
let bulkWriteOperations: AnyBulkWriteOperation<EnrichedJobRecordsSchema>[] = [];
let apiCounter = 0;


async function enrichJobRecords() {
  if (enrichedJobsCollection && stagedJobsCollection && enrichedCloudJobsCollection && stagedCloudJobsCollection) {
    // const enrichedJobs = enrichedJobsCollection.find({});
    const enrichedCloudJobs = enrichedCloudJobsCollection.find({"analyticalInsights": {"$exists": false}});
    console.log("Number of documents to be processed", await enrichedCloudJobsCollection.countDocuments({"analyticalInsights": {"$exists": false}}));
    for await (const enrichedCloudJob of enrichedCloudJobs) {
      console.log(`Working on: ${enrichedCloudJob.originalAdData?.jobTitle}`);
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
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractTechnicalSkillsAndMethodologies(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractBenefitsAndPerks(JSON.stringify(enrichedCloudJob.originalAdData)),
        extractCareerDevelopmentAndRecruitment(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractCompanyAndTeamContext(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractCompensationAndFinancials(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractContractualDetails(JSON.stringify(enrichedCloudJob.originalAdData)),
        extractCulturalAndPsychologicalIndicators(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractLocationAndWorkModel(JSON.stringify(enrichedCloudJob.originalAdData)),
        extractQualificationAndExperience(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
        extractWorkloadAndEnvironmentContext(
          JSON.stringify(enrichedCloudJob.originalAdData),
        ),
      ]);
      apiCounter += 11;
      console.log(`API call count: ${apiCounter}`);
      console.log(
        `All data extracted for job: ${enrichedCloudJob.originalAdData?.jobTitle}`,
      );
      bulkWriteOperations.push({
        updateOne: {
          filter: { _id: enrichedCloudJob._id },
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
        await enrichedCloudJobsCollection.bulkWrite(bulkWriteOperations);
        bulkWriteOperations = [];
      }
    }
    if (bulkWriteOperations.length > 0) {
      console.log(
        `Writing the final batch of ${bulkWriteOperations.length} records.`,
      );
      await enrichedCloudJobsCollection.bulkWrite(bulkWriteOperations);
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
  await closeCloudMongoInstance();
}
