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

import { companyAndTeamContextSchema } from "../schemas/enrichedJobSchema/analyticalInsightsSchema/companyAndTeamContext/companyAndTeamContextSchema.js";
import {
  humanMessageExample1,
  humanMessageExample2,
  humanMessageExample3,
} from "../fewShotExamples/humanMessage/adExamples.js";
import {
  aiMessageExample1,
  aiMessageExample2,
  aiMessageExample3,
} from "../fewShotExamples/aiMessage/companyAndTeamContext.js";

import { companyAndTeamContextSystemMessage } from "../schemas/enrichedJobSchema/analyticalInsightsSchema/companyAndTeamContext/companyAndTeamContextSystemMessage.js";

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";

const model = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH_LITE,
  temperature: 0,
});

const systemMessage = PromptTemplate.fromTemplate(
  companyAndTeamContextSystemMessage,
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

const extractCompanyAndTeamContextPrompt = new ChatPromptTemplate({
  inputVariables: ["placementText", "examples"],
  promptMessages: [
    new SystemMessagePromptTemplate(systemMessage),
    new MessagesPlaceholder("examples"),
    new HumanMessagePromptTemplate(humanMessage),
  ],
});

export async function extractCompanyAndTeamContext(jobAd: string) {
  try {
    const extractedCompanyAndTeamContext =
      await extractCompanyAndTeamContextPrompt
        .pipe(
          model.withStructuredOutput(companyAndTeamContextSchema, {
            name: "companyAndTeamContext",
          }),
        )
        .invoke({ placementText: jobAd, examples: examples });
    const validatedCompanyAndTeamContext =
      companyAndTeamContextSchema.safeParse(extractedCompanyAndTeamContext);
    if (validatedCompanyAndTeamContext.success) {
      return validatedCompanyAndTeamContext.data;
    } else return null;
  } catch (e) {
    console.error("Failed to extract the CompanyAndTeamContext.");
    throw e;
  }
}
