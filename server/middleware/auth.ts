import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../database";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authenticateToken: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verify user still exists
    const result = await pool.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
};

export const optionalAuth: RequestHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const result = await pool.query(
      "SELECT id, email, username FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  } catch (error) {
    // Continue without user if token is invalid
  }

  next();
};
