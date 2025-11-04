import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

async function main() {
  console.log('Starting migration...');

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle({ client: sql });

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('Migration completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed!');
  console.error(err);
  process.exit(1);
});
