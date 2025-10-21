import { z } from "zod";

// =================================================================
// 9. Cultural and Psychological Indicators (Inferred)
// =================================================================

// Enum Definitions
const CompanyCultureArchetypeEnum = z.enum([
  "Stable/Traditional",
  "Startup/Dynamic",
  "Corporate/Formal",
  "Mission-Driven",
  "High-Intensity/Security-Focused",
]);

const CommunicationFormalityAndToneEnum = z.enum([
  "Highly Formal/Corporate",
  "Professional/Friendly",
  "Casual/Informal",
  "Energetic/Intense",
]);

const AutonomyLevelEnum = z.enum([
  "High (Strategic Direction)",
  "Medium (Operational Independence)",
  "Low (Task-Oriented/Supervised)",
]);

const ManagementStyleAndHierarchyEnum = z.enum([
  "Flat/Informal/Agile",
  "Standard Professional",
  "Hierarchical/Formal/Bureaucratic",
]);

// Schema Definition
export const CulturalAndPsychologicalIndicatorsSchema = z.object({
  companyCultureArchetype: CompanyCultureArchetypeEnum.nullable()
    .default(null)
    .describe(
      "Definition: An inferred classification of the company's overall work environment, values, and pace, based on the language and tone of the advertisement. Inference Guide (Psychologist/Data Extraction View): Analyze the 'companyIntro' and 'jobDescription'. Phrases like 'stabilní české společnosti' (stable Czech company) or long history imply 'Stable/Traditional'. Language emphasizing lack of bureaucracy ('Nejsme žádný korporát' - We are not a corporation) or 'startupový mindset' points to 'Startup/Dynamic'. Emphasis on societal impact ('Vaše práce bude mít smysl') indicates 'Mission-Driven'. A tone focused on high-stakes work, like 'Setkávat se s reálnými útoky' (Dealing with real attacks), indicates 'High-Intensity/Security-Focused'.",
    ),
  communicationFormalityAndTone: CommunicationFormalityAndToneEnum.nullable()
    .default(null)
    .describe(
      "Definition: The style and tone of voice used in the advertisement, reflecting the company's likely internal communication style. Inference Guide (Psychologist View): Assessed by analyzing the language used. Highly energetic language (e.g., 'Znáš seriál MR. ROBOT?', 'NEkecám') indicates 'Energetic/Intense'. Use of colloquialisms, friendly greetings ('Ahoj!'), or explicit statements like 'tykáme si tady' (we use informal address) suggests 'Casual/Informal'. Formal language, common in government or standardized international English, indicates 'Highly Formal/Corporate'.",
    ),
  autonomyLevel: AutonomyLevelEnum.nullable()
    .default(null)
    .describe(
      "Definition: The inferred degree of independence, self-direction, and decision-making authority expected in the role. Inference Guide (Recruiter/Data Extraction View): 'High' autonomy is inferred from roles described as 'nově vzniklou klíčovou roli' (newly created key role) with responsibility to 'vybudovat interní procesy' (build internal processes), or explicit benefits like 'Vlastní organizace náplně práce' (Own organization of workload). 'Medium' is common in senior technical roles emphasizing 'Samostatnost' (Independence). 'Low' is typical for L1 support roles focused on following procedures.",
    ),
  managementStyleAndHierarchy: ManagementStyleAndHierarchyEnum.nullable()
    .default(null)
    .describe(
      "Definition: The inferred organizational structure and the level of formality in decision-making. Inference Guide (Psychologist/Recruiter View): Inferred from structural descriptions and tone. Explicit mentions like 'Plochou organizační strukturu' (Flat structure) or strong assertions like 'Nejsme žádný korporát, řešíme vše rychle a osobně' indicate 'Flat/Informal/Agile'. Roles within government ('Ministerstvo') or traditional institutions often imply 'Hierarchical/Formal/Bureaucratic'.",
    ),
});
