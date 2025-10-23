import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";
dotenv.config();

import {qualificationsAndExperienceSchema} from "../schemas/enrichedJobSchema/analyticalInsightsSchema/qualificationAndExperience/qualificationAndExperienceSchema.js";
import {
  humanMessageExample1,
  humanMessageExample2,
  humanMessageExample3,
} from "../fewShotExamples/humanMessage/adExamples.js";
import {
  aiMessageExample1,
  aiMessageExample2,
  aiMessageExample3,
} from "../fewShotExamples/aiMessage/qualificationsAndExperience.js";

import { qualificationAndExperienceSystemMessage} from "../schemas/enrichedJobSchema/analyticalInsightsSchema/qualificationAndExperience/qualificationAndExperienceSystemMessage.js";

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";

const model = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH_LITE,
  temperature: 0,
});

const systemMessage = PromptTemplate.fromTemplate(
  qualificationAndExperienceSystemMessage,
);

const humanMessage = PromptTemplate.fromTemplate("{placementText}");

const examples = [
  new HumanMessage(humanMessageExample1),
  new AIMessage(JSON.stringify(aiMessageExample1)),
  new HumanMessage(humanMessageExample2),
  new AIMessage(JSON.stringify(aiMessageExample2)),
  new HumanMessage(humanMessageExample3),
  new AIMessage(JSON.stringify(aiMessageExample3)),
];

const extractQualificationAndExperiencePrompt = new ChatPromptTemplate({
  inputVariables: ["placementText", "examples"],
  promptMessages: [
    new SystemMessagePromptTemplate(systemMessage),
    new MessagesPlaceholder("examples"),
    new HumanMessagePromptTemplate(humanMessage),
  ],
});

export async function extractQualificationAndExperience(jobAd: string) {
  try {
    const extractedQualificationAndExperience = await extractQualificationAndExperiencePrompt
      .pipe(
        model.withStructuredOutput(qualificationsAndExperienceSchema, {
          name: "qualificationAndExperience",
        }),
      )
      .invoke({ placementText: jobAd, examples: examples });
    const validatedQualificationAndExperience =
      qualificationsAndExperienceSchema.safeParse(extractedQualificationAndExperience);
    if (validatedQualificationAndExperience.success) {
      return validatedQualificationAndExperience.data;
    } else return null;
  } catch (e) {
    console.error("Failed to extract the QualificationAndExperience.");
    throw e;
  }
}
