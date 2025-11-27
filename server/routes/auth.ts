import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
// import { v4 as uuidv4 } from 'uuid';
import pool from "../database";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, first_name, last_name, date_of_birth } =
      req.body;

    // Validation
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Email, username, and password are required" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email or username already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, username, first_name, last_name, created_at`,
      [email, username, password_hash, first_name, last_name, date_of_birth]
    );

    const user = result.rows[0];

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    const getExpiresIn = () => {
      const v = process.env.JWT_EXPIRES_IN;
      if (!v) return "7d";
      const n = Number(v);
      return Number.isFinite(n) ? (n as number) : (v as unknown as any);
    };
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: getExpiresIn(),
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const result = await pool.query(
      "SELECT id, email, username, password_hash, first_name, last_name FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    const getExpiresIn = () => {
      const v = process.env.JWT_EXPIRES_IN;
      if (!v) return "7d";
      const n = Number(v);
      return Number.isFinite(n) ? (n as number) : (v as unknown as any);
    };
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: getExpiresIn(),
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, first_name, last_name, date_of_birth, 
              profile_image_url, created_at 
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { first_name, last_name, date_of_birth, profile_image_url } =
      req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, date_of_birth = $3, 
           profile_image_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, username, first_name, last_name, date_of_birth, profile_image_url`,
      [first_name, last_name, date_of_birth, profile_image_url, req.user!.id]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
