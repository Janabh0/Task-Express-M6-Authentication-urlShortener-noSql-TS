import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
