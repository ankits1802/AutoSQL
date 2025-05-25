'use server';

/**
 * @fileOverview An AI agent that explains SQL queries.
 *
 * - explainSql - A function that handles the SQL explanation process.
 * - ExplainSqlInput - The input type for the explainSql function.
 * - ExplainSqlOutput - The return type for the explainSql function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSqlInputSchema = z.object({
  sqlQuery: z.string().describe('The SQL query to explain.'),
});
export type ExplainSqlInput = z.infer<typeof ExplainSqlInputSchema>;

const ExplainSqlOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the SQL query.'),
});
export type ExplainSqlOutput = z.infer<typeof ExplainSqlOutputSchema>;

export async function explainSql(input: ExplainSqlInput): Promise<ExplainSqlOutput> {
  return explainSqlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSqlPrompt',
  input: {schema: ExplainSqlInputSchema},
  output: {schema: ExplainSqlOutputSchema},
  prompt: `You are an expert SQL explainer. Your task is to explain the given SQL query in simple terms so that a student can understand the logic. Provide a detailed explanation of what the query does, including the tables involved, the conditions used, and the expected result.

SQL Query: {{{sqlQuery}}}`,
});

const explainSqlFlow = ai.defineFlow(
  {
    name: 'explainSqlFlow',
    inputSchema: ExplainSqlInputSchema,
    outputSchema: ExplainSqlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
