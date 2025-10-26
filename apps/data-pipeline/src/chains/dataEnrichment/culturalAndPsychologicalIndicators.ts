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

import { culturalAndPsychologicalIndicatorsSchema } from "../../schemas/enrichedJobSchema/analyticalInsightsSchema/culturalAndPsychologicalIndicators/culturalAndPsychologicalIndicatorsSchema.js";
import {
  humanMessageExample1,
  humanMessageExample2,
  humanMessageExample3,
} from "./fewShotExamples/humanMessage/adExamples.js";
import {
  aiMessageExample1,
  aiMessageExample2,
  aiMessageExample3,
} from "./fewShotExamples/aiMessage/culturalAndPsychologicalIndicators.js";

import { culturalAndPsychologicalIndicatorsSystemMessage } from "./systemMessages/culturalAndPsychologicalIndicatorsSystemMessage.js";

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";

const model = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH_LITE,
  temperature: 0,
});

const systemMessage = PromptTemplate.fromTemplate(
  culturalAndPsychologicalIndicatorsSystemMessage,
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

const extractCulturalAndPsychologicalIndicatorsPrompt = new ChatPromptTemplate({
  inputVariables: ["placementText", "examples"],
  promptMessages: [
    new SystemMessagePromptTemplate(systemMessage),
    new MessagesPlaceholder("examples"),
    new HumanMessagePromptTemplate(humanMessage),
  ],
});

export async function extractCulturalAndPsychologicalIndicators(jobAd: string) {
  try {
    const extractedCulturalAndPsychologicalIndicators =
      await extractCulturalAndPsychologicalIndicatorsPrompt
        .pipe(
          model.withStructuredOutput(culturalAndPsychologicalIndicatorsSchema, {
            name: "culturalAndPsychologicalIndicators",
          }),
        )
        .invoke({ placementText: jobAd, examples: examples });
    console.log(`The name of the running function: ${"extractCulturalAndPsychologicalIndicators"}`);
    const validatedCulturalAndPsychologicalIndicators =
      culturalAndPsychologicalIndicatorsSchema.safeParse(
        extractedCulturalAndPsychologicalIndicators,
      );
    if (validatedCulturalAndPsychologicalIndicators.success) {
      return validatedCulturalAndPsychologicalIndicators.data;
    } else return null;
  } catch (e) {
    console.error("Failed to extract the CulturalAndPsychologicalIndicators.");
    throw e;
  }
}
