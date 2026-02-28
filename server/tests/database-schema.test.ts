/**
 * Database Schema Test Script
 * Validates that all tables, indexes, constraints, and triggers exist correctly.
 * Run: npx tsx server/tests/database-schema.test.ts
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
});

// Colored output
const green = (s: string) => `\x1b[32m✅ ${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m❌ ${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

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

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

// ─── Helper: Check if a table exists ──────────────────
async function tableExists(tableName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    )`,
    [tableName]
  );
  return result.rows[0].exists;
}

// ─── Helper: Get column names for a table ─────────────
async function getColumns(tableName: string): Promise<string[]> {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tableName]
  );
  return result.rows.map((r: { column_name: string }) => r.column_name);
}

// ─── Helper: Check if an index exists ─────────────────
async function indexExists(indexName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM pg_indexes WHERE indexname = $1
    )`,
    [indexName]
  );
  return result.rows[0].exists;
}

// ─── Helper: Check if extension is loaded ─────────────
async function extensionExists(extName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM pg_extension WHERE extname = $1
    )`,
    [extName]
  );
  return result.rows[0].exists;
}

// ─── Tests ────────────────────────────────────────────

async function runTests() {
  console.log(bold("\n🗄️  Red Petal Database Schema Tests\n"));

  // 1. Database connection
  await test("1. Database connection", async () => {
    const result = await pool.query("SELECT 1 AS check");
    assert(result.rows[0].check === 1, "Query returned unexpected result");
  });

  // 2. Required extensions
  await test("2. Extension: pgcrypto", async () => {
    assert(await extensionExists("pgcrypto"), "pgcrypto extension not found");
  });

  await test("3. Extension: pg_trgm", async () => {
    assert(await extensionExists("pg_trgm"), "pg_trgm extension not found");
  });

  // 4. Core tables exist
  const requiredTables = [
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
    "schema_migrations",
  ];

  for (let i = 0; i < requiredTables.length; i++) {
    const table = requiredTables[i];
    await test(`${i + 4}. Table: ${table}`, async () => {
      assert(await tableExists(table), `Table '${table}' does not exist`);
    });
  }

  const tableOffset = 4 + requiredTables.length;

  // Enhanced columns check
  await test(`${tableOffset}. Users table has enhanced columns`, async () => {
    const cols = await getColumns("users");
    const required = ["bio", "phone", "locale", "is_active", "last_login_at"];
    for (const col of required) {
      assert(cols.includes(col), `Missing column: users.${col}`);
    }
  });

  await test(`${tableOffset + 1}. Daily logs has enhanced columns`, async () => {
    const cols = await getColumns("daily_logs");
    const required = ["energy_level", "sleep_hours", "water_intake", "exercise_minutes"];
    for (const col of required) {
      assert(cols.includes(col), `Missing column: daily_logs.${col}`);
    }
  });

  await test(`${tableOffset + 2}. Community posts has moderation columns`, async () => {
    const cols = await getColumns("community_posts");
    const required = ["is_pinned", "status", "view_count"];
    for (const col of required) {
      assert(cols.includes(col), `Missing column: community_posts.${col}`);
    }
  });

  // Performance indexes
  const requiredIndexes = [
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
  ];

  for (let i = 0; i < requiredIndexes.length; i++) {
    const index = requiredIndexes[i];
    await test(`${tableOffset + 3 + i}. Index: ${index}`, async () => {
      assert(await indexExists(index), `Index '${index}' not found`);
    });
  }

  const indexOffset = tableOffset + 3 + requiredIndexes.length;

  // Trigram indexes for search
  await test(`${indexOffset}. Trigram index: posts content`, async () => {
    assert(await indexExists("idx_posts_content_trgm"), "Trigram index on posts content missing");
  });

  await test(`${indexOffset + 1}. Trigram index: remedies title`, async () => {
    assert(await indexExists("idx_remedies_title_trgm"), "Trigram index on remedies title missing");
  });

  // Trigger function exists
  await test(`${indexOffset + 2}. Trigger function: update_updated_at_column`, async () => {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT FROM pg_proc WHERE proname = 'update_updated_at_column'
      )`
    );
    assert(result.rows[0].exists, "Trigger function not found");
  });

  // Schema migration recorded
  await test(`${indexOffset + 3}. Schema migration v2 recorded`, async () => {
    const result = await pool.query(
      `SELECT * FROM schema_migrations WHERE version = 2`
    );
    assert(result.rows.length > 0, "Migration v2 not recorded");
  });

  // Constraint checks via INSERT/ROLLBACK
  await test(`${indexOffset + 4}. CHECK constraint: severity 1-5`, async () => {
    try {
      await pool.query("BEGIN");
      // Insert a dummy user first
      const userResult = await pool.query(
        `INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id`,
        [`schema-test-${Date.now()}@test.com`, `schema_test_${Date.now()}`, "hash"]
      );
      const userId = userResult.rows[0].id;
      // Try invalid severity
      let threw = false;
      try {
        await pool.query(
          `INSERT INTO symptoms (user_id, date, symptom_type, severity) VALUES ($1, $2, $3, $4)`,
          [userId, "2025-01-01", "cramp", 10]
        );
      } catch {
        threw = true;
      }
      assert(threw, "Should have rejected severity 10");
    } finally {
      await pool.query("ROLLBACK");
    }
  });

  // ─── Summary ────────────────────────────────────────
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(bold("  Database Schema Test Results\n"));
  console.log(`  ${green(`Passed: ${passed}`)}`);
  if (failed > 0) console.log(`  ${red(`Failed: ${failed}`)}`);
  console.log(`  Total:  ${passed + failed}`);
  console.log(bold("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(async (err) => {
  console.error("Fatal error:", err);
  await pool.end();
  process.exit(1);
});
