import express from 'express';
import pool from '../database';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Create a new resource
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, url, resource_type, category } = req.body;
    const user_id = req.user!.id;

    if (!title || !resource_type || !category) {
      return res.status(400).json({ 
        error: 'Title, resource type, and category are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO resources (user_id, title, description, url, resource_type, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, title, description, url, resource_type, category]
    );

    res.status(201).json({
      message: 'Resource created successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Resource creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resources with filters
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      category, 
      resource_type,
      user_id, 
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    let query = `
      SELECT 
        r.*,
        u.username,
        u.first_name,
        u.last_name
      FROM resources r
      LEFT JOIN users u ON r.user_id = u.id
    `;

    const params: any[] = [];
    let paramIndex = 1;
    const conditions: string[] = [];

    if (category) {
      conditions.push(`r.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (resource_type) {
      conditions.push(`r.resource_type = $${paramIndex}`);
      params.push(resource_type);
      paramIndex++;
    }

    if (user_id) {
      conditions.push(`r.user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      ORDER BY r.${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      resources: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Resources fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single resource
router.get('/:resourceId', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { resourceId } = req.params;

    const result = await pool.query(`
      SELECT 
        r.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url
      FROM resources r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [resourceId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Resource fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resource categories and types
router.get('/meta/categories-types', async (req, res) => {
  try {
    const categoriesResult = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM resources
      GROUP BY category
      ORDER BY count DESC
    `);

    const typesResult = await pool.query(`
      SELECT resource_type, COUNT(*) as count
      FROM resources
      GROUP BY resource_type
      ORDER BY count DESC
    `);

    const defaultCategories = [
      'menstrual_health',
      'nutrition',
      'exercise',
      'mental_health',
      'reproductive_health',
      'general_wellness',
      'education'
    ];

    const defaultTypes = [
      'article',
      'video',
      'podcast',
      'book',
      'app',
      'website',
      'research'
    ];

    const categoriesWithCounts = defaultCategories.map(cat => {
      const found = categoriesResult.rows.find(row => row.category === cat);
      return {
        category: cat,
        count: found ? parseInt(found.count) : 0
      };
    });

    const typesWithCounts = defaultTypes.map(type => {
      const found = typesResult.rows.find(row => row.resource_type === type);
      return {
        type: type,
        count: found ? parseInt(found.count) : 0
      };
    });

    res.json({
      categories: categoriesWithCounts,
      types: typesWithCounts
    });
  } catch (error) {
    console.error('Meta fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search resources
router.get('/search/:query', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const result = await pool.query(`
      SELECT 
        r.*,
        u.username
      FROM resources r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.title ILIKE $1 OR r.description ILIKE $1 OR r.category ILIKE $1
      ORDER BY r.created_at DESC
      LIMIT $2
    `, [`%${query}%`, limit]);

    res.json({
      resources: result.rows,
      query,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Resource search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update resource (only by author)
router.put('/:resourceId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resourceId } = req.params;
    const { title, description, url, resource_type, category } = req.body;
    const user_id = req.user!.id;

    const result = await pool.query(
      `UPDATE resources 
       SET title = $1, description = $2, url = $3, 
           resource_type = $4, category = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, url, resource_type, category, resourceId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found or not authorized to update' });
    }

    res.json({
      message: 'Resource updated successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Resource update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete resource (only by author)
router.delete('/:resourceId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { resourceId } = req.params;
    const user_id = req.user!.id;

    const result = await pool.query(
      'DELETE FROM resources WHERE id = $1 AND user_id = $2 RETURNING id',
      [resourceId, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found or not authorized to delete' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Resource deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;