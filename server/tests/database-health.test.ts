/**
 * PostgreSQL Database Health & Schema Test Script
 * Verifies database connectivity, schema integrity, indexes, and triggers.
 *
 * Run: npx tsx server/tests/database-health.test.ts
 */

import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
  user: process.env.DB_USER || "proximus",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "redpetal",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
  connectionTimeoutMillis: 5000,
});

// ─── Colored Output Helpers ────────────────────────────────
const green = (s: string) => `\x1b[32m✅ ${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m❌ ${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m⚠️  ${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

let passed = 0;
let failed = 0;
let warnings = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(green(name));
    passed++;
  } catch (err: any) {
    console.log(red(`${name} — ${err.message}`));
    failed++;
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg);
}

function warn(name: string, msg: string): void {
  console.log(yellow(`${name} — ${msg}`));
  warnings++;
}

// ─── Required Tables ───────────────────────────────────────
const REQUIRED_TABLES = [
  "schema_migrations",
  "users",
  "user_preferences",
  "period_cycles",
  "symptoms",
  "moods",
  "community_posts",
  "post_images",
  "comments",
  "likes",
  "home_remedies",
  "remedy_ratings",
  "resources",
  "daily_logs",
  "bookmarks",
  "report_flags",
  "notifications",
];

// ─── Required Indexes ──────────────────────────────────────
const REQUIRED_INDEXES = [
  "idx_period_cycles_user_date",
  "idx_symptoms_user_date",
  "idx_moods_user_date",
  "idx_posts_created_at",
  "idx_posts_category",
  "idx_posts_status",
  "idx_comments_post_id",
  "idx_likes_post_id",
  "idx_likes_user_id",
  "idx_daily_logs_user_date",
  "idx_bookmarks_user",
  "idx_notifications_user",
  "idx_report_flags_status",
  "idx_remedies_category",
  "idx_resources_type",
  "idx_users_email",
  "idx_users_username",
  "idx_unique_post_like",
  "idx_unique_comment_like",
  // Full-text search indexes
  "idx_posts_content_trgm",
  "idx_remedies_title_trgm",
  "idx_resources_title_trgm",
];

// ─── Required Extensions ──────────────────────────────────
const REQUIRED_EXTENSIONS = ["pgcrypto", "pg_trgm"];

// ─── Tests ─────────────────────────────────────────────────
async function runTests() {
  console.log(bold("\n🗄️  Red Petal Database Health Tests\n"));
  console.log(cyan(`Database: ${process.env.DB_NAME || "redpetal"}`));
  console.log(cyan(`Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}\n`));

  // 1. Basic connectivity
  await test("1. Database connection", async () => {
    const result = await pool.query("SELECT 1 as ok");
    assert(result.rows[0].ok === 1, "Ping query failed");
  });

  // 2. PostgreSQL version
  await test("2. PostgreSQL version ≥ 14", async () => {
    const result = await pool.query("SHOW server_version");
    const version = result.rows[0].server_version;
    const major = parseInt(version.split(".")[0]);
    console.log(dim(`   Version: ${version}`));
    assert(major >= 14, `Expected PostgreSQL ≥ 14, got ${version}`);
  });

  // 3. Required extensions
  await test("3. Required extensions installed", async () => {
    const result = await pool.query(
      "SELECT extname FROM pg_extension WHERE extname = ANY($1)",
      [REQUIRED_EXTENSIONS]
    );
    const installed = result.rows.map((r: { extname: string }) => r.extname);
    for (const ext of REQUIRED_EXTENSIONS) {
      assert(installed.includes(ext), `Extension "${ext}" not installed`);
    }
    console.log(dim(`   Extensions: ${installed.join(", ")}`));
  });

  // 4. All required tables exist
  await test("4. All required tables exist", async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const existing = result.rows.map((r: { table_name: string }) => r.table_name);
    const missing: string[] = [];
    for (const table of REQUIRED_TABLES) {
      if (!existing.includes(table)) {
        missing.push(table);
      }
    }
    console.log(dim(`   Tables found: ${existing.length} / ${REQUIRED_TABLES.length} required`));
    assert(
      missing.length === 0,
      `Missing tables: ${missing.join(", ")}`
    );
  });

  // 5. All required indexes exist
  await test("5. All required indexes exist", async () => {
    const result = await pool.query(`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
    `);
    const existing = result.rows.map((r: { indexname: string }) => r.indexname);
    const missing: string[] = [];
    for (const idx of REQUIRED_INDEXES) {
      if (!existing.includes(idx)) {
        missing.push(idx);
      }
    }
    console.log(dim(`   Indexes found: ${existing.length} total, ${REQUIRED_INDEXES.length} required`));
    if (missing.length > 0) {
      assert(false, `Missing indexes: ${missing.join(", ")}`);
    }
  });

  // 6. Users table columns match schema
  await test("6. Users table schema validation", async () => {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    const cols = result.rows.map((r: { column_name: string }) => r.column_name);
    const required = [
      "id", "email", "username", "password_hash",
      "first_name", "last_name", "date_of_birth",
      "profile_image_url", "bio", "phone", "locale",
      "is_active", "last_login_at", "created_at", "updated_at",
    ];
    const missing = required.filter((c) => !cols.includes(c));
    assert(missing.length === 0, `Missing columns in users: ${missing.join(", ")}`);
  });

  // 7. Daily logs enhanced columns
  await test("7. Daily logs enhanced columns", async () => {
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'daily_logs' AND table_schema = 'public'
    `);
    const cols = result.rows.map((r: { column_name: string }) => r.column_name);
    const enhanced = ["energy_level", "sleep_hours", "water_intake", "exercise_minutes"];
    const missing = enhanced.filter((c) => !cols.includes(c));
    assert(missing.length === 0, `Missing enhanced columns in daily_logs: ${missing.join(", ")}`);
  });

  // 8. Foreign key constraints
  await test("8. Foreign key constraints intact", async () => {
    const result = await pool.query(`
      SELECT COUNT(*) as fk_count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `);
    const count = parseInt(result.rows[0].fk_count);
    console.log(dim(`   Foreign keys: ${count}`));
    assert(count >= 15, `Expected ≥ 15 foreign keys, found ${count}`);
  });

  // 9. Check constraints
  await test("9. Check constraints present", async () => {
    const result = await pool.query(`
      SELECT COUNT(*) as check_count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'CHECK' AND table_schema = 'public'
    `);
    const count = parseInt(result.rows[0].check_count);
    console.log(dim(`   Check constraints: ${count}`));
    assert(count >= 5, `Expected ≥ 5 check constraints, found ${count}`);
  });

  // 10. Updated_at trigger function
  await test("10. Updated_at trigger function exists", async () => {
    const result = await pool.query(`
      SELECT routine_name FROM information_schema.routines
      WHERE routine_name = 'update_updated_at_column' AND routine_schema = 'public'
    `);
    assert(result.rows.length > 0, "Trigger function update_updated_at_column not found");
  });

  // 11. Updated_at triggers applied
  await test("11. Updated_at triggers on key tables", async () => {
    const result = await pool.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND trigger_name LIKE 'trigger_%_updated_at'
    `);
    const triggered = result.rows.map((r: { event_object_table: string }) => r.event_object_table);
    const expected = ["users", "period_cycles", "community_posts", "daily_logs"];
    const missing = expected.filter((t) => !triggered.includes(t));
    console.log(dim(`   Triggered tables: ${triggered.length}`));
    if (missing.length > 0) {
      warn("11", `Missing updated_at triggers: ${missing.join(", ")}`);
    }
  });

  // 12. Schema migration tracked
  await test("12. Schema migration version recorded", async () => {
    const result = await pool.query(
      "SELECT version, name FROM schema_migrations ORDER BY version DESC LIMIT 1"
    );
    assert(result.rows.length > 0, "No migration records found");
    console.log(dim(`   Latest migration: v${result.rows[0].version} — ${result.rows[0].name}`));
  });

  // 13. Unique constraints
  await test("13. Unique constraints validated", async () => {
    const result = await pool.query(`
      SELECT tc.table_name, tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
    `);
    const tables = result.rows.map((r: { table_name: string }) => r.table_name);
    assert(tables.includes("users"), "Missing unique constraint on users");
    assert(tables.includes("daily_logs"), "Missing unique constraint on daily_logs");
    console.log(dim(`   Unique constraints: ${result.rows.length}`));
  });

  // 14. Pool health
  await test("14. Connection pool health", async () => {
    const totalCount = pool.totalCount;
    const idleCount = pool.idleCount;
    const waitingCount = pool.waitingCount;
    console.log(dim(`   Total: ${totalCount}, Idle: ${idleCount}, Waiting: ${waitingCount}`));
    assert(waitingCount === 0, `${waitingCount} clients waiting for connections`);
  });

  // 15. Table row counts (informational)
  await test("15. Table sizes accessible", async () => {
    const result = await pool.query(`
      SELECT
        schemaname,
        relname AS table_name,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
      LIMIT 10
    `);
    for (const row of result.rows) {
      console.log(dim(`   ${row.table_name}: ~${row.row_count} rows`));
    }
    assert(result.rows.length > 0, "No table stats available");
  });

  // ─── Summary ─────────────────────────────────────────────
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(bold("  Database Health Results\n"));
  console.log(`  ${green(`Passed: ${passed}`)}`);
  if (failed > 0) console.log(`  ${red(`Failed: ${failed}`)}`);
  if (warnings > 0) console.log(`  ${yellow(`Warnings: ${warnings}`)}`);
  console.log(`  Total:  ${passed + failed}`);
  console.log(bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(async (err) => {
  console.error("Fatal error:", err);
  await pool.end();
  process.exit(1);
});
