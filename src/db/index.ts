import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as schema from './schema';
import type { NeonQueryFunction } from '@neondatabase/serverless';

config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql: NeonQueryFunction<boolean, boolean> = neon(process.env.DATABASE_URL);

// Enhanced drizzle instance with:
// - Schema for type inference
// - Logger for development
// - Custom configuration
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});
