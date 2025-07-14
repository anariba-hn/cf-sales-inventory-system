import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';

async function main() {
  try {
    console.log('🔄 Running migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('✅ Migrations applied.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed: \n\n', error);
    process.exit(1);
  }
}

main();
