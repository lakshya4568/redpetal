import express from "express";
import pool from "../database";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

const asyncHandler = (
  fn: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<any>
): express.RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Create a new home remedy
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { title, description, ingredients, instructions, category } =
        req.body;
      const user_id = req.user!.id;

      if (!title || !description || !instructions || !category) {
        return res.status(400).json({
          error: "Title, description, instructions, and category are required",
        });
      }

      const result = await pool.query(
        `INSERT INTO home_remedies (user_id, title, description, ingredients, instructions, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
        [user_id, title, description, ingredients, instructions, category]
      );

      res.status(201).json({
        message: "Home remedy created successfully",
        remedy: result.rows[0],
      });
    } catch (error) {
      console.error("Remedy creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Get home remedies with filters
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const {
        limit = 20,
        offset = 0,
        category,
        user_id,
        search,
        sort_by = "created_at",
        sort_order = "DESC",
      } = req.query;

      let query = `
      SELECT 
        hr.*,
        u.username,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT rr.id) as rating_count
      FROM home_remedies hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN remedy_ratings rr ON hr.id = rr.remedy_id
    `;

      const params: any[] = [];
      let paramIndex = 1;
      const conditions: string[] = [];

      if (category) {
        conditions.push(`hr.category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      if (user_id) {
        conditions.push(`hr.user_id = $${paramIndex}`);
        params.push(user_id);
        paramIndex++;
      }

      if (search) {
        conditions.push(
          `(hr.title ILIKE $${paramIndex} OR hr.description ILIKE $${paramIndex})`
        );
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += `
      GROUP BY hr.id, u.username, u.first_name, u.last_name
      ORDER BY hr.${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

      params.push(limit, offset);

      const result = await pool.query(query, params);

      const remedies = result.rows.map((row: any) => ({
        ...row,
        rating_count: parseInt(row.rating_count),
      }));

      res.json({
        remedies,
        total: remedies.length,
      });
    } catch (error) {
      console.error("Remedies fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Get single remedy with details
router.get(
  "/:remedyId",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { remedyId } = req.params;

      const remedyResult = await pool.query(
        `
      SELECT 
        hr.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT rr.id) as rating_count,
        AVG(rr.rating) as avg_rating
      FROM home_remedies hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN remedy_ratings rr ON hr.id = rr.remedy_id
      WHERE hr.id = $1
      GROUP BY hr.id, u.username, u.first_name, u.last_name, u.profile_image_url
    `,
        [remedyId]
      );

      if (remedyResult.rows.length === 0) {
        return res.status(404).json({ error: "Remedy not found" });
      }

      const remedy = {
        ...remedyResult.rows[0],
        rating_count: parseInt(remedyResult.rows[0].rating_count),
        avg_rating: remedyResult.rows[0].avg_rating
          ? parseFloat(remedyResult.rows[0].avg_rating)
          : 0,
      };

      // Get recent ratings/reviews
      const ratingsResult = await pool.query(
        `
      SELECT 
        rr.*,
        u.username,
        u.first_name,
        u.last_name
      FROM remedy_ratings rr
      LEFT JOIN users u ON rr.user_id = u.id
      WHERE rr.remedy_id = $1
      ORDER BY rr.created_at DESC
      LIMIT 10
    `,
        [remedyId]
      );

      res.json({
        remedy,
        recent_ratings: ratingsResult.rows,
      });
    } catch (error) {
      console.error("Remedy fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Rate a remedy
router.post(
  "/:remedyId/rate",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { remedyId } = req.params;
      const { rating, review } = req.body;
      const user_id = req.user!.id;

      if (!rating || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      // Check if remedy exists
      const remedyCheck = await pool.query(
        "SELECT id FROM home_remedies WHERE id = $1",
        [remedyId]
      );
      if (remedyCheck.rows.length === 0) {
        return res.status(404).json({ error: "Remedy not found" });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Insert or update rating
        const result = await client.query(
          `INSERT INTO remedy_ratings (user_id, remedy_id, rating, review)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, remedy_id)
         DO UPDATE SET rating = $3, review = $4, created_at = CURRENT_TIMESTAMP
         RETURNING *`,
          [user_id, remedyId, rating, review]
        );

        // Update remedy's average rating and total ratings
        await client.query(
          `
        UPDATE home_remedies 
        SET effectiveness_rating = (
          SELECT AVG(rating) FROM remedy_ratings WHERE remedy_id = $1
        ),
        total_ratings = (
          SELECT COUNT(*) FROM remedy_ratings WHERE remedy_id = $1
        )
        WHERE id = $1
      `,
          [remedyId]
        );

        await client.query("COMMIT");

        res.json({
          message: "Rating submitted successfully",
          rating: result.rows[0],
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Rating error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Get remedy categories
router.get(
  "/categories/list",
  asyncHandler(async (req, res) => {
    try {
      const result = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM home_remedies
      GROUP BY category
      ORDER BY count DESC
    `);

      const categories = [
        "cramps",
        "bloating",
        "mood",
        "headaches",
        "nausea",
        "fatigue",
        "skin",
        "general",
      ];

      const categoriesWithCounts = categories.map((cat) => {
        const found = result.rows.find((row: any) => row.category === cat);
        return {
          category: cat,
          count: found ? parseInt(found.count) : 0,
        };
      });

      res.json({
        categories: categoriesWithCounts,
      });
    } catch (error) {
      console.error("Categories fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Search remedies
router.get(
  "/search/:query",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { query } = req.params;
      const { limit = 10 } = req.query;

      const result = await pool.query(
        `
      SELECT 
        hr.*,
        u.username,
        COUNT(DISTINCT rr.id) as rating_count,
        AVG(rr.rating) as avg_rating
      FROM home_remedies hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN remedy_ratings rr ON hr.id = rr.remedy_id
      WHERE hr.title ILIKE $1 OR hr.description ILIKE $1 OR hr.category ILIKE $1
      GROUP BY hr.id, u.username
      ORDER BY avg_rating DESC NULLS LAST, rating_count DESC
      LIMIT $2
    `,
        [`%${query}%`, limit]
      );

      const remedies = result.rows.map((row: any) => ({
        ...row,
        rating_count: parseInt(row.rating_count),
        avg_rating: row.avg_rating ? parseFloat(row.avg_rating) : 0,
      }));

      res.json({
        remedies,
        query,
        total: remedies.length,
      });
    } catch (error) {
      console.error("Remedy search error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Update remedy (only by author)
router.put(
  "/:remedyId",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { remedyId } = req.params;
      const { title, description, ingredients, instructions, category } =
        req.body;
      const user_id = req.user!.id;

      const result = await pool.query(
        `UPDATE home_remedies 
       SET title = $1, description = $2, ingredients = $3, 
           instructions = $4, category = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
        [
          title,
          description,
          ingredients,
          instructions,
          category,
          remedyId,
          user_id,
        ]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Remedy not found or not authorized to update" });
      }

      res.json({
        message: "Remedy updated successfully",
        remedy: result.rows[0],
      });
    } catch (error) {
      console.error("Remedy update error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Delete remedy (only by author)
router.delete(
  "/:remedyId",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { remedyId } = req.params;
      const user_id = req.user!.id;

      const result = await pool.query(
        "DELETE FROM home_remedies WHERE id = $1 AND user_id = $2 RETURNING id",
        [remedyId, user_id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Remedy not found or not authorized to delete" });
      }

      res.json({ message: "Remedy deleted successfully" });
    } catch (error) {
      console.error("Remedy deletion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

export default router;
