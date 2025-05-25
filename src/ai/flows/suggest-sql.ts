// src/ai/flows/suggest-sql.ts
'use server';
/**
 * @fileOverview An AI agent for generating SQL queries from natural language descriptions.
 *
 * - suggestSql - A function that generates SQL queries from natural language descriptions.
 * - SuggestSqlInput - The input type for the suggestSql function.
 * - SuggestSqlOutput - The return type for the suggestSql function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSqlInputSchema = z.object({
  description: z.string().describe('A natural language description of the desired SQL query.'),
  tableSchema: z.string().describe('The schema of the database table to query.'),
});
export type SuggestSqlInput = z.infer<typeof SuggestSqlInputSchema>;

const SuggestSqlOutputSchema = z.object({
  sqlQuery: z.string().describe('The generated SQL query.'),
});
export type SuggestSqlOutput = z.infer<typeof SuggestSqlOutputSchema>;

export async function suggestSql(input: SuggestSqlInput): Promise<SuggestSqlOutput> {
  return suggestSqlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSqlPrompt',
  input: {schema: SuggestSqlInputSchema},
  output: {schema: SuggestSqlOutputSchema},
  prompt: `You are an expert SQL developer. Generate an SQL query based on the user's description and the table schema provided.

Description: {{{description}}}
Table Schema: {{{tableSchema}}}

SQL Query: `,
});

const suggestSqlFlow = ai.defineFlow(
  {
    name: 'suggestSqlFlow',
    inputSchema: SuggestSqlInputSchema,
    outputSchema: SuggestSqlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
