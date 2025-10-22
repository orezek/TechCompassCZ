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

import {benefitsAndPerksSchema} from "../schemas/enrichedJobSchema/analyticalInsightsSchema/benefitsAndPerks/benefitsAndPerksSchema.js";
import {
  humanMessageExample1,
  humanMessageExample2,
  humanMessageExample3,
} from "../fewShotExamples/humanMessage/adExamples.js";
import {
  aiMessageExample1,
  aiMessageExample2,
  aiMessageExample3,
} from "../fewShotExamples/aiMessage/benefitsAdnPerks.js"
import { benefitsAndPerksSystemMessage } from "../schemas/enrichedJobSchema/analyticalInsightsSchema/benefitsAndPerks/benefitsAndPerksSystemMessage.js";

const GEM_MODELS_FLASH_LITE = "gemini-2.5-flash-lite";
const GEM_MODELS_FLASH = "gemini-2.5-flash";
const GEM_MODELS_PRO = "gemini-2.5-pro";

const jobAd =
  "49\t2000767889\tSenior C# / .NET Backend Developer\tUp Česká republika s.r.o.\tPraha – Braník\t\t\tPracovní nabídka Senior C# / .NET Backend Developer Kdo jsme Jsme fintech společnost zaměřená na digitální zaměstnanecké benefity a pomáháme firmám s motivací a odměnováním zaměstnanců. Hledáme kolegu, který kromě vývoje ovládá návrh rozsáhlých informačních systémů a databázových architektur a pomůže nám posunout naší BackOffice platoformu na další úroveň. Co tě čeká · Návrh a vývoj zcela nového BackOffice systému. · Spolutvorba architektury velkého distribuovaného systému s důrazem na škálovatelnost a spolehlivost. · Vývoj backendových mikroslužeb v C# / .NET (Core).. · Návrh a implementace REST i event-driven API (OpenAPI, AsyncAPI). · Databázový návrh: modelování schémat v PostgreSQL, optimalizace, migrace, ... · Integrace s Redis (caching) a ElasticSearch (fulltext, reporting). · Spolupráce s DevOps na CI/CD (GitLab, Docker, Kubernetes). · Code-reviews, mentoring kolegů a sdílení know-how. · Aktivní zapojení do architektonických rozhodnutí a výběru nástrojů. Bez čeho se neobejdeš · 2+ let zkušeností s C# / .NET (Core). · Zkušenost s návrhem a realizací rozsáhlých informačních systémů. · Silné znalosti databázového návrhu a zpracování dat (normalizace, indexy, ETL, reporting). · Pokročilá práce s PostgreSQL (indexy, performance tuning, plpgsql). · Zkušenost s návrhem robustních REST/JSON API. · Orientace v mikroslužbové a kontejnerové architektuře. · Git, CI/CD a Docker je v tvém DNA stejně jako C#. · Analytické a systémové myšlení, samostatnost a zodpovědnost. Co nabízíme · Reálný vliv na klíčový systém s mezinárodním dosahem. · Hybridní režim: 2 dny home-office. · 100 % hrazená eStravenka v hodnotě 180 Kč/den · 20 000 Kč ročně na eBenefity. · 5 týdnů dovolené, příspěvku na penzijní připojištění · Příspěvek na penzijní připojištění\t• Vzdělávací kurzy, školení • Firemní akce • Stravenky/příspěvek na stravování • Dovolená 5 týdnů • Bonusy/prémie • Příspěvek na dopravu • Možnost občasné práce z domova • Flexibilní začátek/konec pracovní doby • Příspěvek na penzijní/životní připojištění • Kafetérie\t\tSpolečnost: Up Česká republika s.r.o. Požadované vzdělání: Vysokoškolské / univerzitní Požadované jazyky: Angličtina (Středně pokročilá) Zařazeno: IS/IT: Konzultace, analýzy a projektové řízení, IS/IT: Vývoj aplikací a systémů , IT analytik, DevOps vývojář, Programátor, Tester Typ pracovního poměru: Práce na plný úvazek Délka pracovního poměru: Na dobu neurčitou Typ smluvního vztahu: pracovní smlouva Zadavatel: Zaměstnavatel\tKontakt: Ela Honická ela.honicka@upcz.cz\thttps://www.jobs.cz/rpd/2000767889/?searchId=d6696164-8417-4148-b11b-a9e5a942281a&rps=233\tjobscz\t\t\t\t\t\t\t\t\t\t\t\t";

const model = new ChatGoogleGenerativeAI({
  model: GEM_MODELS_FLASH_LITE,
  temperature: 0,
});

const systemMessage = PromptTemplate.fromTemplate(
  benefitsAndPerksSystemMessage,
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

const extractCorePositionAndDetailsPrompt = new ChatPromptTemplate({
  inputVariables: ["placementText", "examples"],
  promptMessages: [
    new SystemMessagePromptTemplate(systemMessage),
    new MessagesPlaceholder("examples"),
    new HumanMessagePromptTemplate(humanMessage),
  ],
});

export async function extractBenefitsAndPerks(jobAd: string) {
  try {
    const extractCorePosition = await extractCorePositionAndDetailsPrompt
      .pipe(
        model.withStructuredOutput(benefitsAndPerksSchema, {
          name: "corePositionAndDetails",
        }),
      )
      .invoke({ placementText: jobAd, examples: examples });
    const validatedCorePositionDetails =
      benefitsAndPerksSchema.safeParse(extractCorePosition);
    if (validatedCorePositionDetails.success) {
      return validatedCorePositionDetails.data;
    } else return null;
  } catch (e) {
    console.error("Failed to extract the CorePositionDetails.");
    throw e;
  }
}
