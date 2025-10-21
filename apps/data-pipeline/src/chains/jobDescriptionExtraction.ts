import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import * as dotenv from "dotenv";
dotenv.config();
import { jobDescriptionSchema } from "../schemas/enrichedJobsSchema.js";

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";

const jobDescription =
  "Pracovní nabídka PHP/ Laravel Developer - Fintech projekty Přidej se k našemu malému fintech týmu, který vyvíjí a provozuje vlastní projekty v České republice, na Islandu a ve Španělsku. Hledáme talentovaného vývojáře, který nám pomůže s rychle rostoucími projekty v oblasti financí a stane se důležitou součástí našeho týmu. Koho hledáme? Do našeho 8členného týmu hledáme PHP/Laravel vývojáře, který: nám pomůže s rychle rostoucím projektem, se nezalekne finančního světa, má chuť dlouhodobě růst společně s námi. Co tě čeká? Vývoj produktů na frameworku Laravel – od konceptu po nasazení Interní projekty (žádný zákaznický vývoj) Spolupráce s produktovým týmem na návrhu a implementaci nových funkcí Dlouhodobý rozvoj a údržba stávajících projektů Integrace s bankami (PSD2), procesy ověřování klientů (KYC) Možnost zapojit se do vývoje machine learning modelů pro scoring a predikce Co uvítáme Zkušenosti s PHP a frameworkem Laravel Praxi s SQL databázemi (MariaDB, PostgreSQL) Znalost HTTP komunikace (REST API, SOAP, cURL) Chuť psát čistý, přehledný a zdokumentovaný kód Týmového hráče, který se rád učí nové věci Zájem o analýzu dat a reporting (Python, dbt) Znalost HTML/CSS/JS/SASS výhodou Znalost verzovacích systémů (Git) výhodou Znalost Composer, npm výhodou Přehled v bezpečnosti a kryptografii výhodou Co nabízíme Mzdu 70 000 – 120 000 Kč měsíčně dle zkušeností Dlouhodobou spolupráci a stabilitu Účast na mezinárodních projektech (ČR, Island, Španělsko, UK) Hybridní režim práce 25 dní dovolené + sick days Notebook dle výběru, vlastní pracovní stůl Multisport kartu a nápoje na pracovišti 👉 Pokud tě naše nabídka zaujala, dej nám vědět – rádi si s tebou popovídáme!";

// component
const model = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH,
  temperature: 0,
});

const systemMessage = PromptTemplate.fromTemplate(
  "You are job benefits extractor machine. You can extract a text that format it into a json string.",
);
const humanMessage = PromptTemplate.fromTemplate("{jobDescription}");

const extractBenefitsWithExamplesPrompt = new ChatPromptTemplate({
  inputVariables: ["jobDescription"],
  promptMessages: [
    new SystemMessagePromptTemplate(systemMessage),
    // new MessagesPlaceholder("examples"),
    new HumanMessagePromptTemplate(humanMessage),
  ],
});

const extractBenefits = await extractBenefitsWithExamplesPrompt
  .pipe(model.withStructuredOutput(jobDescriptionSchema, { name: "benefits" }))
  .invoke({ jobDescription: jobDescription });

console.log(extractBenefits);
