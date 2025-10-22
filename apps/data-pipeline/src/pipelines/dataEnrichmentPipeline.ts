import * as dotenv from 'dotenv';
import { connectToDb, client } from "../mongoConnectionDb.js";
import { type EnrichedJobRecordsSchema } from "../schemas/enrichedJobSchema/enrichedJobSchema.js";
import {extractTechnicalSkillsAndMethodologies} from "../chains/technicalSkillsAndMethodologiesExtraction.js";
import {extractCorePositionAndDetails} from "../chains/corePositionDetailsExtraction.js";
import {extractBenefitsAndPerks} from "../chains/benefitsAndPerksExtraction.js";
import { extractCareerDevelopmentAndRecruitment } from "./../chains/careerDevelopmentAndRecruitmentExtraction.js"
dotenv.config();

await connectToDb();
const db = client.db('it-jobs');
const enrichedJobsCollection = db.collection<EnrichedJobRecordsSchema>("enriched-job-records");

async function processStagedJobs() {
  const enrichedJobs = enrichedJobsCollection.find({});
  for await (const enrichedJob of enrichedJobs) {
    // const extractedCorePosition = await extractCorePositionAndDetails(JSON.stringify(enrichedJob.originalAdData));
    const extractedTechnicalSkills = await extractTechnicalSkillsAndMethodologies(JSON.stringify(enrichedJob.originalAdData));
    const extractedBenefitsAndPerks = await extractBenefitsAndPerks(JSON.stringify(enrichedJob.originalAdData));
    const extractedCareerDevelpmentAndRecruitement = await extractCareerDevelopmentAndRecruitment(JSON.stringify(enrichedJob.originalAdData));
    await enrichedJobsCollection.updateOne(
      {_id: enrichedJob._id},
      {
        $set: {
          // Use "dot.notation.inside.quotes" to target the deep field
          // "analyticalInsights.corePositionDetails": extractedCorePosition,
          // "analyticalInsights.technicalSkillsAndMethodologies": extractedTechnicalSkills,
          // "analyticalInsights.benefitsAndPerks": extractedBenefitsAndPerks,
          "analyticalInsights.careerDevelopmentAndRecruitment": extractedCareerDevelpmentAndRecruitement,
        }
      }
    );
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




