/**
 * One-time fix: stamps the drizzle migration tracking table with all already-applied
 * migrations so that future `npm run db:migrate` runs are idempotent.
 *
 * Run once against the target database:
 *   npx tsx ./src/db/fix-migrations.ts
 *
 * Safe to re-run — skips migrations already recorded.
 */
import { neon } from '@neondatabase/serverless';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });
config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const MIGRATIONS_FOLDER = resolve('./src/db/migrations');

interface JournalEntry {
  idx: number;
  tag: string;
  when: number;
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // Drizzle stores migration records in the `drizzle` schema by default
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle."__drizzle_migrations" (
      id       SERIAL PRIMARY KEY,
      hash     text   NOT NULL,
      created_at bigint
    )
  `;

  const applied = await sql`SELECT hash FROM drizzle."__drizzle_migrations"`;
  const appliedHashes = new Set(applied.map((r) => r.hash as string));

  const journal = JSON.parse(
    readFileSync(`${MIGRATIONS_FOLDER}/meta/_journal.json`, 'utf8')
  ) as { entries: JournalEntry[] };

  let stamped = 0;

  for (const entry of journal.entries) {
    const content = readFileSync(`${MIGRATIONS_FOLDER}/${entry.tag}.sql`, 'utf8');
    const hash = createHash('sha256').update(content).digest('hex');

    if (appliedHashes.has(hash)) {
      console.log(`⏭️  Already recorded: ${entry.tag}`);
    } else {
      await sql`
        INSERT INTO drizzle."__drizzle_migrations" (hash, created_at)
        VALUES (${hash}, ${entry.when})
      `;
      console.log(`✅ Stamped: ${entry.tag}`);
      stamped++;
    }
  }

  console.log(stamped === 0
    ? '\nAll migrations already tracked — nothing to do.'
    : `\n✅ Done. ${stamped} migration(s) stamped.`
  );
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
