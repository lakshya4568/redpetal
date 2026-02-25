/**
 * Daily Logs API Routes
 * CRUD for daily symptom logs (flow, mood, skin, notes)
 */

import express, { Request, Response } from "express";
import pool from "../database";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// GET /api/daily-logs?date=YYYY-MM-DD
// Get daily log for a specific date (or today)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const date =
      (req.query.date as string) || new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2`,
      [userId, date],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "No log found for this date" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching daily log:", error);
    res.status(500).json({ error: "Failed to fetch daily log" });
  }
});

// GET /api/daily-logs/range?start=YYYY-MM-DD&end=YYYY-MM-DD
// Get daily logs for a date range
router.get("/range", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({ error: "start and end dates are required" });
      return;
    }

    const result = await pool.query(
      `SELECT * FROM daily_logs WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC`,
      [userId, start, end],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching daily logs range:", error);
    res.status(500).json({ error: "Failed to fetch daily logs" });
  }
});

// POST /api/daily-logs
// Create or update a daily log (upsert by user_id + date)
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { date, flow, mood, skin, notes } = req.body;

    const logDate = date || new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `INSERT INTO daily_logs (user_id, date, flow, mood, skin, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date)
       DO UPDATE SET flow = $3, mood = $4, skin = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, logDate, flow || null, mood || null, skin || [], notes || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving daily log:", error);
    res.status(500).json({ error: "Failed to save daily log" });
  }
});

export default router;
