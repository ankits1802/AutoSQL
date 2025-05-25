
// src/ai/flows/optimize-sql.ts
'use server';
/**
 * @fileOverview An AI agent that analyzes SQL queries for performance bottlenecks and suggests optimizations.
 *
 * - optimizeSql - A function that takes an SQL query as input and returns an optimized version of the query along with suggestions.
 * - OptimizeSqlInput - The input type for the optimizeSql function.
 * - OptimizeSqlOutput - The return type for the optimizeSql function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeSqlInputSchema = z.object({
  sqlQuery: z.string().describe('The SQL query to optimize.'),
});
export type OptimizeSqlInput = z.infer<typeof OptimizeSqlInputSchema>;

const OptimizeSqlOutputSchema = z.object({
  optimizedQuery: z.string().describe('The optimized SQL query.'),
  suggestions: z.array(z.string()).describe('Suggestions for improving query performance.'),
});
export type OptimizeSqlOutput = z.infer<typeof OptimizeSqlOutputSchema>;

export async function optimizeSql(input: OptimizeSqlInput): Promise<OptimizeSqlOutput> {
  return optimizeSqlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeSqlPrompt',
  input: {schema: OptimizeSqlInputSchema},
  output: {schema: OptimizeSqlOutputSchema},
  prompt: `You are an expert SQL optimizer. Analyze the following SQL query for performance bottlenecks and suggest optimizations.

SQL Query:
{{{sqlQuery}}}

Provide the optimized SQL query and a list of suggestions for improving query performance.
`,
});

const optimizeSqlFlow = ai.defineFlow(
  {
    name: 'optimizeSqlFlow',
    inputSchema: OptimizeSqlInputSchema,
    outputSchema: OptimizeSqlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

