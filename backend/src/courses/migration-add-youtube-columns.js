const { Client } = require('d:/gramguru-main/backend/node_modules/pg');
const fs = require('fs');

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
  }
  return env;
}

const env = parseEnv('d:/gramguru-main/backend/.env');
const client = new Client({
  host: env.DB_HOST || 'localhost',
  port: Number(env.DB_PORT) || 5432,
  user: env.DB_USER || 'postgres',
  password: env.DB_PASSWORD || 'postgres',
  database: env.DB_NAME || 'gramguru',
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL database:', env.DB_NAME);

  console.log('Ensuring youtubeUrl and youtubeVideoId columns exist in courses table...');
  await client.query('ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "youtubeUrl" character varying');
  await client.query('ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "youtubeVideoId" character varying');

  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' AND column_name IN ('youtubeUrl', 'youtubeVideoId')");
  console.log('Verified columns in courses table:');
  console.table(res.rows);

  await client.end();
}

run().catch((err) => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
