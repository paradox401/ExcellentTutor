import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
  userId: string;
  role: "STUDENT" | "ADMIN";
};

export type AuthRequest = Request & { auth?: AuthPayload };

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  const token = header.replace("Bearer ", "").trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server auth not configured" });
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.auth.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
};
