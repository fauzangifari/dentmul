// prisma.config.ts
// Load environment variables dari .env
import { config } from 'dotenv'

config({ path: '.env' })

import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Gunakan DIRECT_URL untuk migrasi (direct connection, tanpa pgbouncer)
    // DATABASE_URL (pooler) digunakan oleh Next.js runtime
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'],
  },
})
