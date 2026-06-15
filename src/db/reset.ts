import { db } from './index';
import { sql } from 'drizzle-orm';

async function reset() {
  console.log('🗑️  Dropping all tables...');

  await db.execute(sql`DROP TABLE IF EXISTS sale_item CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS sales CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS payment_method CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS sale_type CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS recipe_item CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS ingredient CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS product CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS category CASCADE`);

  // Old table names from previous schema
  await db.execute(sql`DROP TABLE IF EXISTS sale_product CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS product_type_item CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS product_item CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS product_type CASCADE`);

  await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`);
  await db.execute(sql`DROP TYPE IF EXISTS unit_type CASCADE`);

  console.log('✅ Reset complete.');
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
