import express from 'express';
import pool from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Log period start
router.post('/log', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { period_start_date, notes } = req.body;
    const user_id = req.user!.id;

    if (!period_start_date) {
      return res.status(400).json({ error: 'Period start date is required' });
    }

    // Check if there's already a period logged for this date
    const existingPeriod = await pool.query(
      'SELECT id FROM period_cycles WHERE user_id = $1 AND period_start_date = $2',
      [user_id, period_start_date]
    );

    if (existingPeriod.rows.length > 0) {
      return res.status(409).json({ error: 'Period already logged for this date' });
    }

    // Insert new period cycle
    const result = await pool.query(
      `INSERT INTO period_cycles (user_id, period_start_date, cycle_start_date, notes)
       VALUES ($1, $2, $2, $3)
       RETURNING *`,
      [user_id, period_start_date, notes]
    );

    res.status(201).json({
      message: 'Period logged successfully',
      cycle: result.rows[0]
    });
  } catch (error) {
    console.error('Period logging error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End period
router.put('/end/:cycleId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cycleId } = req.params;
    const { period_end_date } = req.body;
    const user_id = req.user!.id;

    if (!period_end_date) {
      return res.status(400).json({ error: 'Period end date is required' });
    }

    const result = await pool.query(
      `UPDATE period_cycles 
       SET period_end_date = $1, 
           period_length = $1::date - period_start_date + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [period_end_date, cycleId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Period cycle not found' });
    }

    res.json({
      message: 'Period ended successfully',
      cycle: result.rows[0]
    });
  } catch (error) {
    console.error('Period end error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's period history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user!.id;
    const { limit = 12, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM period_cycles 
       WHERE user_id = $1 
       ORDER BY cycle_start_date DESC 
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    res.json({
      cycles: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Period history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate cycle predictions
router.get('/predictions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user!.id;

    // Get last 6 completed cycles for prediction
    const cyclesResult = await pool.query(
      `SELECT cycle_start_date, cycle_length, period_length 
       FROM period_cycles 
       WHERE user_id = $1 AND cycle_length IS NOT NULL
       ORDER BY cycle_start_date DESC 
       LIMIT 6`,
      [user_id]
    );

    const cycles = cyclesResult.rows;

    if (cycles.length < 2) {
      return res.json({
        message: 'Need at least 2 completed cycles for predictions',
        predictions: null
      });
    }

    // Calculate averages
    const avgCycleLength = Math.round(
      cycles.reduce((sum, cycle) => sum + cycle.cycle_length, 0) / cycles.length
    );
    
    const avgPeriodLength = Math.round(
      cycles.reduce((sum, cycle) => sum + (cycle.period_length || 5), 0) / cycles.length
    );

    // Get the last cycle to predict next period
    const lastCycle = cycles[0];
    const lastCycleDate = new Date(lastCycle.cycle_start_date);
    
    // Predict next period
    const nextPeriodDate = new Date(lastCycleDate);
    nextPeriodDate.setDate(lastCycleDate.getDate() + avgCycleLength);

    // Predict fertile window (typically 12-16 days before next period)
    const fertileWindowStart = new Date(nextPeriodDate);
    fertileWindowStart.setDate(nextPeriodDate.getDate() - 16);
    
    const fertileWindowEnd = new Date(nextPeriodDate);
    fertileWindowEnd.setDate(nextPeriodDate.getDate() - 12);

    res.json({
      predictions: {
        next_period_date: nextPeriodDate.toISOString().split('T')[0],
        avg_cycle_length: avgCycleLength,
        avg_period_length: avgPeriodLength,
        fertile_window: {
          start: fertileWindowStart.toISOString().split('T')[0],
          end: fertileWindowEnd.toISOString().split('T')[0]
        }
      },
      cycle_count: cycles.length
    });
  } catch (error) {
    console.error('Predictions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log symptoms
router.post('/symptoms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, symptom_type, severity, notes } = req.body;
    const user_id = req.user!.id;

    if (!date || !symptom_type || !severity) {
      return res.status(400).json({ error: 'Date, symptom type, and severity are required' });
    }

    const result = await pool.query(
      `INSERT INTO symptoms (user_id, date, symptom_type, severity, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, date, symptom_type, severity, notes]
    );

    res.status(201).json({
      message: 'Symptom logged successfully',
      symptom: result.rows[0]
    });
  } catch (error) {
    console.error('Symptom logging error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get symptoms for date range
router.get('/symptoms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user!.id;
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM symptoms WHERE user_id = $1';
    const params: any[] = [user_id];

    if (start_date) {
      query += ' AND date >= $2';
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND date <= $${params.length + 1}`;
      params.push(end_date);
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);

    res.json({
      symptoms: result.rows
    });
  } catch (error) {
    console.error('Symptoms fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log moods
router.post('/moods', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, mood_type, intensity, notes } = req.body;
    const user_id = req.user!.id;

    if (!date || !mood_type || !intensity) {
      return res.status(400).json({ error: 'Date, mood type, and intensity are required' });
    }

    const result = await pool.query(
      `INSERT INTO moods (user_id, date, mood_type, intensity, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, date, mood_type, intensity, notes]
    );

    res.status(201).json({
      message: 'Mood logged successfully',
      mood: result.rows[0]
    });
  } catch (error) {
    console.error('Mood logging error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get moods for date range
router.get('/moods', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user_id = req.user!.id;
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM moods WHERE user_id = $1';
    const params: any[] = [user_id];

    if (start_date) {
      query += ' AND date >= $2';
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND date <= $${params.length + 1}`;
      params.push(end_date);
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);

    res.json({
      moods: result.rows
    });
  } catch (error) {
    console.error('Moods fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;