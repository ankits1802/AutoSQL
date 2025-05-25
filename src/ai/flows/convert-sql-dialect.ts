'use server';
/**
 * @fileOverview An AI agent for converting SQL queries between different dialects.
 *
 * - convertSqlDialect - A function that converts an SQL query from a source dialect to a target dialect.
 * - ConvertSqlDialectInput - The input type for the convertSqlDialect function.
 * - ConvertSqlDialectOutput - The return type for the convertSqlDialect function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DIALECT_CHOICES = z.enum([
  "mysql", 
  "postgresql", 
  "sqlite", 
  "sqlserver", // For Microsoft SQL Server
  "oracle",    // For Oracle PL/SQL
  "generic"    // A generic SQL if source is unknown or target is generic
]);
export type DialectChoice = z.infer<typeof DIALECT_CHOICES>;

const ConvertSqlDialectInputSchema = z.object({
  sqlQuery: z.string().describe('The SQL query to convert.'),
  sourceDialect: DIALECT_CHOICES.describe('The source SQL dialect of the query (e.g., mysql, postgresql, sqlite, sqlserver, oracle).'),
  targetDialect: DIALECT_CHOICES.describe('The target SQL dialect to convert the query to (e.g., mysql, postgresql, sqlite, sqlserver, oracle).'),
});
export type ConvertSqlDialectInput = z.infer<typeof ConvertSqlDialectInputSchema>;

const ConvertSqlDialectOutputSchema = z.object({
  convertedSqlQuery: z.string().describe('The SQL query converted to the target dialect.'),
  notes: z.array(z.string()).optional().describe('Optional notes about the conversion, such as unhandled syntax or assumptions made.'),
});
export type ConvertSqlDialectOutput = z.infer<typeof ConvertSqlDialectOutputSchema>;

export async function convertSqlDialect(input: ConvertSqlDialectInput): Promise<ConvertSqlDialectOutput> {
  return convertSqlDialectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertSqlDialectPrompt',
  input: {schema: ConvertSqlDialectInputSchema},
  output: {schema: ConvertSqlDialectOutputSchema},
  prompt: `You are an expert SQL dialect converter. Your task is to convert the given SQL query from the specified source dialect to the target dialect.

Source Dialect: {{{sourceDialect}}}
Target Dialect: {{{targetDialect}}}
SQL Query to Convert:
\`\`\`sql
{{{sqlQuery}}}
\`\`\`

Please provide the converted SQL query. If there are specific parts of the query that cannot be directly translated or if you make significant assumptions, include them in the 'notes' array.

Focus on accuracy and maintaining the original query's logic. Consider common differences such as:
- LIMIT/TOP/ROWNUM clauses for row limiting.
- Data type differences (e.g., INT vs INTEGER, VARCHAR vs TEXT, DATETIME vs TIMESTAMP).
- Auto-increment/identity column syntax (e.g., AUTO_INCREMENT, SERIAL, IDENTITY).
- String concatenation functions or operators (e.g., CONCAT(), ||).
- Date and time functions.
- Quoting identifiers.
- Comment syntax if it differs significantly (though typically -- and /* */ are common).
- Handling of NULLs.

Return only the converted SQL query in the 'convertedSqlQuery' field. If applicable, provide notes in the 'notes' field. Do not add any other explanatory text outside of the specified output format.
If the source and target dialects are the same, or if one is 'generic' and the query is already very standard, you can return the original query, possibly with a note indicating no changes were necessary.
If the input query is empty or whitespace, return an empty string for 'convertedSqlQuery' and a note saying "Input query was empty."
`,
});

const convertSqlDialectFlow = ai.defineFlow(
  {
    name: 'convertSqlDialectFlow',
    inputSchema: ConvertSqlDialectInputSchema,
    outputSchema: ConvertSqlDialectOutputSchema,
  },
  async (input: ConvertSqlDialectInput) => {
    if (!input.sqlQuery.trim()) {
      return {
        convertedSqlQuery: '',
        notes: ["Input query was empty."]
      };
    }
    if (input.sourceDialect === input.targetDialect) {
      return { 
        convertedSqlQuery: input.sqlQuery,
        notes: ["Source and target dialects are the same. No conversion performed."]
      };
    }
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response for SQL dialect conversion.");
    }
    // Ensure notes is an array even if the LLM returns a single string or null
    if (output.notes && !Array.isArray(output.notes)) {
      output.notes = [String(output.notes)];
    } else if (!output.notes) {
      output.notes = [];
    }
    return output;
  }
);
