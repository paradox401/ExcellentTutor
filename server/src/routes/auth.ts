import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, ClassLevel } from "../models";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  classLevelId: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }

  const { name, email, password, classLevelId } = parsed.data;
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const classLevel = await ClassLevel.findById(classLevelId).lean();
  if (!classLevel) {
    return res.status(400).json({ message: "Invalid class selection" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userDoc = await User.create({ name, email, passwordHash, classLevelId });
  const user = { id: userDoc._id.toString(), name, email, role: userDoc.role };

  const token = signToken(user.id, user.role);
  return res.status(201).json({ user, token });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken(user.id, user.role);
  return res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      classLevelId: user.classLevelId?.toString(),
    },
    token,
  });
});

const signToken = (userId: string, role: "STUDENT" | "ADMIN") => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ userId, role }, secret, { expiresIn: "7d" });
};

export default router;
