import { defineConfig, env } from '@prisma/config';
import 'dotenv/config';

const isTest = process.env.NODE_ENV === 'TEST';
const isDev = process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'development';

export default defineConfig({
  schema: 'prisma/schemas',
  typedSql: {
    path: 'prisma/sql',
  },
  migrations: {
    seed: 'ts-node prisma/seeders/index.ts',
    path: 'prisma/migrations',
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
