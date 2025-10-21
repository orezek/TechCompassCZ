import { z } from "zod";

// =================================================================
// 4. Benefits and Perks
// =================================================================

// Schema Definition
export const BenefitsAndPerksSchema = z.object({
  paidVacationDays: z
    .number()
    .int()
    .nullable()
    .default(null)
    .describe(
      "Definition: The number of paid vacation days offered annually. Inference Guide: Extract the explicit number. In the Czech context, 'Extra week of vacation' or '5 týdnů dovolené' means 25 days. If not specified, return null.",
    ),

  sickDays: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if paid sick days are offered. Inference Guide: Set to TRUE if 'Sick days' or 'Zdravotní volno' is explicitly mentioned. Default to FALSE.",
    ),

  mealAllowance: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if meal vouchers or a meal allowance is provided. Inference Guide: Set to TRUE if 'Meal allowance', 'Meal vouchers', 'Stravenky', or 'Stravenkový paušál' are mentioned. Default to FALSE.",
    ),

  healthInsurance: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if private health insurance or above-standard medical care is provided. Inference Guide: Set to TRUE if 'Private Clinic', or 'Nadstandardní lékařská péče' is mentioned. Default to FALSE.",
    ),

  wellnessBenefits: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of benefits related to wellness, sports, culture, or leisure. Inference Guide: Extract specific offerings like 'Multisport Card', 'Cafeteria' ('Kafetérie'), or 'Příspěvek na sport/kulturu/volný čas'.",
    ),

  companyCar: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if a company car is provided. Inference Guide: Set to TRUE if 'Company Car' or 'Auto i pro soukromé účely' (Car for private use) is mentioned. Default to FALSE.",
    ),

  hardwareProvided: z
    .array(z.string())
    .default([])
    .describe(
      "Definition: List of standard hardware equipment provided or subsidized. Inference Guide: Extract specific items mentioned, such as 'Laptop' ('Notebook'), 'Mobile Phone' ('Mobilní telefon').",
    ),

  trainingBudget: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if a budget for professional training is provided. Inference Guide: Set to TRUE if 'Training budget', 'Vzdělávací kurzy, školení', or specific platforms (e.g., Pluralsight) are mentioned. Default to FALSE.",
    ),
});
