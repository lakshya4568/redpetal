
import request from 'supertest';
import express from 'express';
import periodRoutes from '../routes/periods';
import { Pool } from 'pg';

// Mock dependencies
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@example.com', username: 'testuser' };
    next();
  },
}));

// Initialize express app
const app = express();
app.use(express.json());
app.use('/periods', periodRoutes);

describe('POST /periods/log', () => {
  let pool: any;

  beforeEach(() => {
    pool = new Pool();
    pool.query.mockReset();
  });

  it('should log a new period', async () => {
    // 1. Check if there's already a period logged for this date (return empty)
    pool.query.mockResolvedValueOnce({ rows: [] });
    // 2. Query for previous cycle (return empty for first cycle)
    pool.query.mockResolvedValueOnce({ rows: [] });
    // 3. Insert new period cycle
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'cycle-1', period_start_date: '2023-01-01' }] });

    const res = await request(app)
      .post('/periods/log')
      .send({ period_start_date: '2023-01-01' });

    expect(res.status).toBe(201);
  });

  it('should update previous cycle length when logging a new period', async () => {
     // 1. Check for existing period (none)
     pool.query.mockResolvedValueOnce({ rows: [] });

     // 2. Query for previous cycle (should find one)
     const prevCycleStart = '2023-01-01';
     pool.query.mockResolvedValueOnce({
         rows: [{
             id: 'cycle-1',
             user_id: 'user-123',
             cycle_start_date: prevCycleStart
         }]
     });

     // 3. Update previous cycle (mock response)
     pool.query.mockResolvedValueOnce({ rows: [{ id: 'cycle-1' }] });

     // 4. Insert new period
     pool.query.mockResolvedValueOnce({ rows: [{ id: 'cycle-2', period_start_date: '2023-02-01' }] });

     const res = await request(app)
      .post('/periods/log')
      .send({ period_start_date: '2023-02-01' });

     expect(res.status).toBe(201);

     // Verify calls
     // 1. Check exist
     // 2. Find prev
     // 3. Update prev
     // 4. Insert new
     expect(pool.query).toHaveBeenCalledTimes(4);

     // Check the Update call (3rd call, index 2)
     const updateCall = pool.query.mock.calls[2];
     expect(updateCall[0]).toContain('UPDATE period_cycles');
     expect(updateCall[0]).toContain('SET cycle_end_date = $1, cycle_length = $2');

     // Parameters:
     // $1: cycle_end_date (2023-01-31)
     // $2: cycle_length (31)
     // $3: id
     const params = updateCall[1];
     expect(params[0]).toMatch(/2023-01-31/); // exact format might vary depending on how date is constructed
     expect(params[1]).toBe(31);
     expect(params[2]).toBe('cycle-1');
  });
});
