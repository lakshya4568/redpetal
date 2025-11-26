import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

// Load env from project root - must happen before Pool is created
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || "proximus",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "redpetal",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Database schema creation
export const createTables = async () => {
  const client = await pool.connect();
  try {
    // Ensure required extensions are available
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);

    // Users table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Period cycles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS period_cycles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        cycle_start_date DATE NOT NULL,
        cycle_end_date DATE,
        period_start_date DATE NOT NULL,
        period_end_date DATE,
        cycle_length INTEGER,
        period_length INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Symptoms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS symptoms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        symptom_type VARCHAR(50) NOT NULL,
        severity INTEGER CHECK (severity >= 1 AND severity <= 5),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Moods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS moods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        mood_type VARCHAR(50) NOT NULL,
        intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Community posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Likes table
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

    // Home remedies table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Remedy ratings table
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

    // Resources table
    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        url TEXT,
        resource_type VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_period_cycles_user_date ON period_cycles(user_id, cycle_start_date);
      CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON symptoms(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON community_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
