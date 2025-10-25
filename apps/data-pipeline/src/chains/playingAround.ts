import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import * as dotenv from "dotenv";
import {
  JsonOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
dotenv.config();

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";

// component
const model = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH_LITE,
  temperature: 0,
});

// Use promptTemplate for super basic prompt design - no roles.
// component
const instructPrompt = new PromptTemplate({
  template: `Format the answer in JSON format (country: capital). What is the capital city of {userInput}.`,
  inputVariables: ["userInput"],
});

// component
const stringOutputParser = new StringOutputParser();
const jsonOutputParser = new JsonOutputParser();

// chain is being created by piping the components
const instructChain = instructPrompt.pipe(model).pipe(jsonOutputParser);
// chain is being executed
const instructResult = await instructChain.invoke({ userInput: "Portugal" });
console.log(instructResult);

// ------------

const chatPrompt = new ChatPromptTemplate({
  inputVariables: ["countryName"],
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      "You are a world renowned geographer who will list 3 three longest rivers per given country. Your output is a json string.",
    ),
    HumanMessagePromptTemplate.fromTemplate("{countryName}"),
  ],
});

const chatChain = chatPrompt.pipe(model).pipe(jsonOutputParser);

const countries = ["Russia", "North Korea", "India", "Canada"];

async function longestRiverPerCountry(country: string) {
  console.log(`The name of the running function: ${"longestRiverPerCountry"}`);
  return await chatChain.invoke({ countryName: country });
}

for (const country of countries) {
  console.log(await longestRiverPerCountry(country));
}
