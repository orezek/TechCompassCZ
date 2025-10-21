import { z } from "zod";

// =================================================================
// 3. Compensation and Financials
// =================================================================

// Enum Definitions
const SalaryPeriodEnum = z.enum([
  "Monthly",
  "Annually",
  "Hourly",
  "Daily (MD)",
]);

const BonusTypeEnum = z.enum([
  "Quarterly",
  "Annual",
  "Performance-based",
  "13th Salary",
  "Profit Sharing",
  "Sign-on Bonus",
]);

// Schema Definition
export const CompensationAndFinancialsSchema = z.object({
  salaryMin: z
    .number()
    .int()
    .nullable()
    .default(null)
    .describe(
      "Definition: The minimum salary offered. CRITICAL: NORMALIZE TO A MONTHLY BASIS. Inference Guide: Extract the lower number from a provided range. If a daily rate (MD) is given, multiply by 20. If an annual salary is given, divide by 12. If no salary is mentioned, return null.",
    ),

  salaryMax: z
    .number()
    .int()
    .nullable()
    .default(null)
    .describe(
      "Definition: The maximum salary offered. CRITICAL: NORMALIZE TO A MONTHLY BASIS. Inference Guide: Extract the higher number from a provided range. If only a single figure is provided, use it for both Min and Max. If no salary is mentioned, return null.",
    ),

  salaryCurrency: z
    .string()
    .length(3)
    .nullable()
    .default(null)
    .describe(
      "Definition: The currency of the salary (ISO 4217 code). Inference Guide: Infer from the job location (e.g., Prague defaults to 'CZK') or explicit mention. If salaryMin is null, this should also be null.",
    ),

  salaryPeriod: SalaryPeriodEnum.nullable()
    .default(null)
    .describe(
      "Definition: The period the salary figures represent in the source text (BEFORE normalization). Inference Guide: 'Monthly' is standard for HPP. 'Daily (MD)' is common for IČO. If salaryMin is null, this should also be null.",
    ),

  bonusAvailability: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the compensation package includes bonuses. Inference Guide: Set to TRUE if the benefits mention 'Bonuses', 'Prémie', or specific bonus structures. Default to FALSE.",
    ),

  bonusType: z
    .array(BonusTypeEnum)
    .default([])
    .describe(
      "Definition: List of the types or frequencies of bonuses offered. Inference Guide: Extract explicit types mentioned, such as 'Quarterly bonuses', 'roční bonus' (Annual), or '13. plat' (13th Salary).",
    ),

  stockOptions: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if stock options or equity are part of the compensation. Inference Guide: Set to TRUE if 'Stock Options', 'Equity', or 'Stock Purchase program' are explicitly mentioned. Default to FALSE.",
    ),

  pensionContribution: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the employer contributes to pension or life insurance. Inference Guide: Set to TRUE if 'Pension insurance' or 'Příspěvek na penzijní/životní připojištění' is mentioned. Default to FALSE.",
    ),
});
