import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-sql.ts';
import '@/ai/flows/optimize-sql.ts';
import '@/ai/flows/explain-sql.ts';
import '@/ai/flows/convert-sql-dialect.ts'; // Added new flow
