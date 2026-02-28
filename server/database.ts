import dotenv from "dotenv";
import path from "path";
import { Pool, PoolClient } from "pg";

// Load env from project root - must happen before Pool is created
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// PostgreSQL connection configuration with connection pooling tuning
const pool = new Pool({
  user: process.env.DB_USER || "proximus",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "redpetal",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
  // Connection pool tuning
  max: parseInt(process.env.DB_POOL_MAX || "20"),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Health check helper — verifies database connectivity
export const checkDatabaseHealth = async (): Promise<{
  connected: boolean;
  latencyMs: number;
  version: string;
}> => {
  const start = Date.now();
  try {
    const result = await pool.query("SELECT version()");
    return {
      connected: true,
      latencyMs: Date.now() - start,
      version: result.rows[0].version,
    };
  } catch {
    return { connected: false, latencyMs: Date.now() - start, version: "" };
  }
};

// Helper: run a query inside a client (for transactions)
const runInTransaction = async (
  fn: (client: PoolClient) => Promise<void>,
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await fn(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Database schema creation
export const createTables = async () => {
  const client = await pool.connect();
  try {
    // Ensure required extensions are available
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search
    `);

    // ─── Schema Migrations Table ───────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Users Table (enhanced) ────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        date_of_birth DATE,
        profile_image_url TEXT,
        bio TEXT,
        phone VARCHAR(20),
        locale VARCHAR(10) DEFAULT 'en',
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── User Preferences Table ────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        theme_palette VARCHAR(50) DEFAULT 'redPetal',
        notifications_enabled BOOLEAN DEFAULT true,
        cycle_reminder_days INTEGER DEFAULT 2,
        daily_log_reminder BOOLEAN DEFAULT true,
        reminder_time TIME DEFAULT '09:00:00',
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Period Cycles Table (enhanced) ────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS period_cycles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        cycle_start_date DATE NOT NULL,
        cycle_end_date DATE,
        period_start_date DATE NOT NULL,
        period_end_date DATE,
        cycle_length INTEGER CHECK (cycle_length > 0 AND cycle_length <= 90),
        period_length INTEGER CHECK (period_length > 0 AND period_length <= 30),
        notes TEXT,
        is_irregular BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Symptoms Table (enhanced) ─────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS symptoms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        symptom_type VARCHAR(50) NOT NULL,
        severity INTEGER CHECK (severity >= 1 AND severity <= 5),
        duration_hours DECIMAL(5,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Moods Table (enhanced) ────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        mood_type VARCHAR(50) NOT NULL,
        intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
        triggers TEXT[],
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Community Posts Table (enhanced) ──────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        is_anonymous BOOLEAN DEFAULT false,
        is_pinned BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'deleted')),
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Post Images Table ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Comments Table (enhanced) ─────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        is_anonymous BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'deleted')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Likes Table ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
      );
    `);

    // ─── Unique constraint on likes (one like per user per item) ──
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_post_like
        ON likes(user_id, post_id) WHERE post_id IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_comment_like
        ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL;
    `);

    // ─── Home Remedies Table (enhanced) ────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_remedies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        ingredients TEXT[],
        instructions TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        effectiveness_rating DECIMAL(3,2) DEFAULT 0.00,
        total_ratings INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        tags TEXT[],
        prep_time_minutes INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Remedy Ratings Table ──────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS remedy_ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        remedy_id UUID REFERENCES home_remedies(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, remedy_id)
      );
    `);

    // ─── Resources Table (enhanced) ────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url TEXT,
        resource_type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        thumbnail_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Daily Logs Table (enhanced) ───────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        flow VARCHAR(20),
        mood VARCHAR(20),
        skin TEXT[],
        energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
        sleep_hours DECIMAL(4,1),
        water_intake INTEGER,
        exercise_minutes INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);

    // ─── Bookmarks Table (new) ─────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        remedy_id UUID REFERENCES home_remedies(id) ON DELETE CASCADE,
        resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (
          (post_id IS NOT NULL)::int +
          (remedy_id IS NOT NULL)::int +
          (resource_id IS NOT NULL)::int = 1
        )
      );
    `);

    // ─── Report Flags Table (content moderation) ───────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'harassment', 'misinformation', 'inappropriate', 'other')),
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
      );
    `);

    // ─── Notifications Table (new) ─────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'reminder', 'system')),
        title VARCHAR(255) NOT NULL,
        body TEXT,
        data JSONB DEFAULT '{}',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Performance Indexes ───────────────────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_period_cycles_user_date ON period_cycles(user_id, cycle_start_date);
      CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON symptoms(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON community_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_category ON community_posts(category);
      CREATE INDEX IF NOT EXISTS idx_posts_status ON community_posts(status) WHERE status = 'active';
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_report_flags_status ON report_flags(status) WHERE status = 'pending';
      CREATE INDEX IF NOT EXISTS idx_remedies_category ON home_remedies(category);
      CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    // ─── Full-text search indexes (pg_trgm) ────────────────
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_content_trgm ON community_posts USING gin (content gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_remedies_title_trgm ON home_remedies USING gin (title gin_trgm_ops);
      CREATE INDEX IF NOT EXISTS idx_resources_title_trgm ON resources USING gin (title gin_trgm_ops);
    `);

    // ─── Updated_at trigger function ───────────────────────
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply updated_at triggers to all relevant tables
    const tablesWithUpdatedAt = [
      "users",
      "user_preferences",
      "period_cycles",
      "community_posts",
      "comments",
      "home_remedies",
      "resources",
      "daily_logs",
    ];
    for (const table of tablesWithUpdatedAt) {
      await client.query(`
        DO $$ BEGIN
          CREATE TRIGGER trigger_${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }

    // ─── Record migration version ──────────────────────────
    await client.query(`
      INSERT INTO schema_migrations (version, name)
      VALUES (2, 'enhanced_schema_v2')
      ON CONFLICT (version) DO NOTHING;
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
    throw error;
  } finally {
    client.release();
  }
};

export { runInTransaction };
export default pool;
