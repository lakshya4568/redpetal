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

// Helper to wrap async handlers and ensure correct RequestHandler typing
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

// Create a new post
router.post(
  "/posts",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const {
        title,
        content,
        category = "general",
        is_anonymous = false,
        images = [],
      } = req.body;
      const user_id = req.user!.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Post content is required" });
      }

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Create the post
        const postResult = await client.query(
          `INSERT INTO community_posts (user_id, title, content, category, is_anonymous)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
          [user_id, title, content, category, is_anonymous]
        );

        const post = postResult.rows[0];

        // Add images if provided
        if (images && images.length > 0) {
          for (const imageUrl of images) {
            await client.query(
              "INSERT INTO post_images (post_id, image_url) VALUES ($1, $2)",
              [post.id, imageUrl]
            );
          }
        }

        await client.query("COMMIT");

        res.status(201).json({
          message: "Post created successfully",
          post: {
            ...post,
            images: images,
          },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Post creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Get posts with pagination
router.get(
  "/posts",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { limit = 20, offset = 0, category, user_id } = req.query;
      const currentUserId = req.user?.id;

      let query = `
      SELECT 
        p.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as is_liked,
        array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM community_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = $1
      LEFT JOIN post_images pi ON p.id = pi.post_id
    `;

      const params: any[] = [currentUserId];
      let paramIndex = 2;

      if (category) {
        query += ` WHERE p.category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (user_id) {
        query += category ? " AND" : " WHERE";
        query += ` p.user_id = $${paramIndex}`;
        params.push(user_id);
        paramIndex++;
      }

      query += `
      GROUP BY p.id, u.username, u.first_name, u.last_name, u.profile_image_url, user_likes.user_id
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

      params.push(limit, offset);

      const result = await pool.query(query, params);

      const posts = result.rows.map((row: any) => ({
        ...row,
        like_count: parseInt(row.like_count),
        comment_count: parseInt(row.comment_count),
        images: row.images
          ? row.images.filter((img: string | null) => img !== null)
          : [],
      }));

      res.json({
        posts,
        total: posts.length,
      });
    } catch (error) {
      console.error("Posts fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Get single post with details
router.get(
  "/posts/:postId",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;

      const postResult = await pool.query(
        `
      SELECT 
        p.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        CASE WHEN user_likes.user_id IS NOT NULL THEN true ELSE false END as is_liked,
        array_agg(DISTINCT pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM community_posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN likes user_likes ON p.id = user_likes.post_id AND user_likes.user_id = $1
      LEFT JOIN post_images pi ON p.id = pi.post_id
      WHERE p.id = $2
      GROUP BY p.id, u.username, u.first_name, u.last_name, u.profile_image_url, user_likes.user_id
    `,
        [currentUserId, postId]
      );

      if (postResult.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      const post = {
        ...postResult.rows[0],
        like_count: parseInt(postResult.rows[0].like_count),
        comment_count: parseInt(postResult.rows[0].comment_count),
        images: postResult.rows[0].images
          ? postResult.rows[0].images.filter(
              (img: string | null) => img !== null
            )
          : [],
      };

      res.json({ post });
    } catch (error) {
      console.error("Post fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Like/unlike a post
router.post(
  "/posts/:postId/like",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const user_id = req.user!.id;

      // Check if post exists
      const postCheck = await pool.query(
        "SELECT id FROM community_posts WHERE id = $1",
        [postId]
      );
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if already liked
      const existingLike = await pool.query(
        "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
        [user_id, postId]
      );

      if (existingLike.rows.length > 0) {
        // Unlike
        await pool.query(
          "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
          [user_id, postId]
        );
        res.json({ message: "Post unliked successfully", liked: false });
      } else {
        // Like
        await pool.query(
          "INSERT INTO likes (user_id, post_id) VALUES ($1, $2)",
          [user_id, postId]
        );
        res.json({ message: "Post liked successfully", liked: true });
      }
    } catch (error) {
      console.error("Like toggle error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Add comment to post
router.post(
  "/posts/:postId/comments",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { content, parent_comment_id, is_anonymous = false } = req.body;
      const user_id = req.user!.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Comment content is required" });
      }

      // Check if post exists
      const postCheck = await pool.query(
        "SELECT id FROM community_posts WHERE id = $1",
        [postId]
      );
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      const result = await pool.query(
        `INSERT INTO comments (post_id, user_id, content, parent_comment_id, is_anonymous)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
        [postId, user_id, content, parent_comment_id, is_anonymous]
      );

      res.status(201).json({
        message: "Comment added successfully",
        comment: result.rows[0],
      });
    } catch (error) {
      console.error("Comment creation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Get comments for a post
router.get(
  "/posts/:postId/comments",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const result = await pool.query(
        `
      SELECT 
        c.*,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_image_url,
        COUNT(DISTINCT l.id) as like_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN likes l ON c.id = l.comment_id
      WHERE c.post_id = $1
      GROUP BY c.id, u.username, u.first_name, u.last_name, u.profile_image_url
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `,
        [postId, limit, offset]
      );

      const comments = result.rows.map((row: any) => ({
        ...row,
        like_count: parseInt(row.like_count),
      }));

      res.json({
        comments,
        total: comments.length,
      });
    } catch (error) {
      console.error("Comments fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

// Delete post (only by author)
router.delete(
  "/posts/:postId",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    try {
      const { postId } = req.params;
      const user_id = req.user!.id;

      const result = await pool.query(
        "DELETE FROM community_posts WHERE id = $1 AND user_id = $2 RETURNING id",
        [postId, user_id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Post not found or not authorized to delete" });
      }

      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Post deletion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);

export default router;
