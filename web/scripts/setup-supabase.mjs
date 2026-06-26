#!/usr/bin/env node
/**
 * Apply initial migration to Supabase Postgres.
 * Usage: SUPABASE_DB_PASSWORD='...' node scripts/setup-supabase.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const PROJECT_REF = 'liedowqqnzrklygdaqkw'
const password = process.env.SUPABASE_DB_PASSWORD

if (!password) {
  console.error('Set SUPABASE_DB_PASSWORD (Dashboard → Settings → Database)')
  process.exit(1)
}

const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/postgres`

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = join(__dirname, '../supabase/migrations/20260626100000_initial.sql')
const sql = readFileSync(sqlPath, 'utf8')

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  console.log('Connected to Supabase Postgres')
  await client.query(sql)
  console.log('Migration applied successfully')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
