/**
 * Reports API Routes
 * Monthly report computations for cycle, symptoms, and trends
 */

import express, { Request, Response } from "express";
import pool from "../database";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// GET /api/reports/monthly?year=2024&month=10
// Get monthly report data
router.get(
  "/monthly",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const year =
        parseInt(req.query.year as string) || new Date().getFullYear();
      const month =
        parseInt(req.query.month as string) || new Date().getMonth() + 1;

      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // Last day of month

      // Get cycle data
      const cycleResult = await pool.query(
        `SELECT * FROM period_cycles 
       WHERE user_id = $1 
       AND cycle_start_date >= $2 
       AND cycle_start_date <= $3
       ORDER BY cycle_start_date DESC
       LIMIT 1`,
        [userId, startDate, endDate],
      );

      // Get daily logs for the month
      const logsResult = await pool.query(
        `SELECT * FROM daily_logs 
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date ASC`,
        [userId, startDate, endDate],
      );

      // Get symptom data for the month
      const symptomsResult = await pool.query(
        `SELECT symptom_type, COUNT(*) as count 
       FROM symptoms 
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       GROUP BY symptom_type
       ORDER BY count DESC`,
        [userId, startDate, endDate],
      );

      // Get mood frequency
      const moodResult = await pool.query(
        `SELECT mood, COUNT(*) as count
       FROM daily_logs
       WHERE user_id = $1 AND date >= $2 AND date <= $3 AND mood IS NOT NULL
       GROUP BY mood
       ORDER BY count DESC`,
        [userId, startDate, endDate],
      );

      // Compute averages
      const cycle = cycleResult.rows[0];
      const logs = logsResult.rows;

      // Flow distribution
      const flowCounts: Record<string, number> = {};
      logs.forEach((log: any) => {
        if (log.flow) {
          flowCounts[log.flow] = (flowCounts[log.flow] || 0) + 1;
        }
      });

      res.json({
        month: `${year}-${String(month).padStart(2, "0")}`,
        cycle: cycle
          ? {
              cycleLength: cycle.cycle_length,
              periodLength: cycle.period_length,
              startDate: cycle.cycle_start_date,
              endDate: cycle.cycle_end_date,
            }
          : null,
        dailyLogs: logs,
        symptoms: symptomsResult.rows.map((r: any) => ({
          type: r.symptom_type,
          count: parseInt(r.count),
        })),
        moods: moodResult.rows.map((r: any) => ({
          mood: r.mood,
          count: parseInt(r.count),
        })),
        flowDistribution: flowCounts,
        totalLogDays: logs.length,
      });
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  },
);

export default router;
