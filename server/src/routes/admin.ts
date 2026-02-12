import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import {
  ClassLevel,
  Course,
  Module,
  Material,
  Video,
  Question,
  LiveSession,
  Payment,
  Subscription,
  User,
  SubscriptionPlan,
  ClassLevel,
} from "../models";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", async (_req, res) => {
  const classes = await ClassLevel.find().sort({ grade: 1 }).lean();
  const courses = await Course.find().lean();
  const modules = await Module.find().lean();
  const materials = await Material.find().lean();
  const videos = await Video.find().lean();
  const questions = await Question.find().lean();
  const liveSessions = await LiveSession.find().lean();
  res.json({ classes, courses, modules, materials, videos, questions, liveSessions });
});

router.post("/classes", async (req: AuthRequest, res) => {
  const schema = z.object({
    grade: z.enum(["GRADE_8", "GRADE_9", "GRADE_10"]).or(z.string().min(3)),
    title: z.string().min(2),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const classLevel = await ClassLevel.create(parsed.data);
  res.status(201).json({ classLevel });
});

router.post("/classes/:id", async (req, res) => {
  const schema = z.object({ title: z.string().min(2), grade: z.string().min(3) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const classLevel = await ClassLevel.findByIdAndUpdate(req.params.id, parsed.data, {
    returnDocument: "after",
  });
  res.json({ classLevel });
});

router.delete("/classes/:id", async (req, res) => {
  await ClassLevel.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.post("/courses", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(4),
    classLevelId: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const course = await Course.create(parsed.data);
  res.status(201).json({ course });
});

router.post("/courses/:id", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    description: z.string().min(4),
    classLevelId: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const course = await Course.findByIdAndUpdate(req.params.id, parsed.data, {
    returnDocument: "after",
  });
  res.json({ course });
});

router.delete("/courses/:id", async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.post("/modules", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    summary: z.string().min(4),
    courseId: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const moduleItem = await Module.create(parsed.data);
  res.status(201).json({ module: moduleItem });
});

router.post("/modules/:id", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    summary: z.string().min(4),
    courseId: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const moduleItem = await Module.findByIdAndUpdate(req.params.id, parsed.data, {
    returnDocument: "after",
  });
  res.json({ module: moduleItem });
});

router.delete("/modules/:id", async (req, res) => {
  await Module.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.post("/materials", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    moduleId: z.string().min(6),
    fileUrl: z.string().url(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const material = await Material.create(parsed.data);
  res.status(201).json({ material });
});

router.post("/materials/:id", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    moduleId: z.string().min(6),
    fileUrl: z.string().url(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const material = await Material.findByIdAndUpdate(req.params.id, parsed.data, {
    returnDocument: "after",
  });
  res.json({ material });
});

router.delete("/materials/:id", async (req, res) => {
  await Material.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.post("/questions", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    moduleId: z.string().min(6),
    fileUrl: z.string().url(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const question = await Question.create(parsed.data);
  res.status(201).json({ question });
});

router.post("/questions/:id", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    moduleId: z.string().min(6),
    fileUrl: z.string().url(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const question = await Question.findByIdAndUpdate(req.params.id, parsed.data, {
    returnDocument: "after",
  });
  res.json({ question });
});

router.delete("/questions/:id", async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.post("/videos", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    moduleId: z.string().min(6),
    videoUrl: z.string().url(),
    chapters: z
      .array(
        z.object({
          label: z.string().min(1),
          time: z.number().min(0),
        })
      )
      .optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const video = await Video.create(parsed.data);
  res.status(201).json({ video });
});

router.post("/videos/:id", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    moduleId: z.string().min(6),
    videoUrl: z.string().url(),
    chapters: z
      .array(
        z.object({
          label: z.string().min(1),
          time: z.number().min(0),
        })
      )
      .optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const video = await Video.findByIdAndUpdate(req.params.id, parsed.data, {
    returnDocument: "after",
  });
  res.json({ video });
});

router.delete("/videos/:id", async (req, res) => {
  await Video.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.post("/live-sessions", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    courseId: z.string().min(6),
    meetingUrl: z.string().url(),
    scheduledAt: z.string().datetime(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const session = await LiveSession.create({
    ...parsed.data,
    scheduledAt: new Date(parsed.data.scheduledAt),
  });
  res.status(201).json({ session });
});

router.post("/live-sessions/:id", async (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    courseId: z.string().min(6),
    meetingUrl: z.string().url(),
    scheduledAt: z.string().datetime(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }
  const session = await LiveSession.findByIdAndUpdate(
    req.params.id,
    { ...parsed.data, scheduledAt: new Date(parsed.data.scheduledAt) },
    { returnDocument: "after" }
  );
  res.json({ session });
});

router.delete("/live-sessions/:id", async (req, res) => {
  await LiveSession.findByIdAndDelete(req.params.id);
  res.json({ status: "deleted" });
});

router.get("/payments", async (_req, res) => {
  const payments = await Payment.find({ provider: "MANUAL", status: "PENDING" }).lean();
  const subscriptions = await Subscription.find({ _id: { $in: payments.map((p) => p.subscriptionId) } })
    .lean();
  const users = await User.find({ _id: { $in: subscriptions.map((s) => s.userId) } })
    .lean();
  const data = payments.map((payment) => {
    const subscription = subscriptions.find((s) => String(s._id) === String(payment.subscriptionId));
    const user = users.find((u) => String(u._id) === String(subscription?.userId));
    return {
      payment,
      subscription,
      user: user
        ? { id: user._id, name: user.name, email: user.email }
        : null,
    };
  });
  res.json({ payments: data });
});

router.get("/users", async (_req, res) => {
  const users = await User.find().lean();
  const subscriptions = await Subscription.find({ userId: { $in: users.map((u) => u._id) } })
    .sort({ createdAt: -1 })
    .lean();
  const plans = await SubscriptionPlan.find().lean();
  const classes = await ClassLevel.find().lean();

  const data = users.map((user) => {
    const sub = subscriptions.find((s) => String(s.userId) === String(user._id));
    const plan = plans.find((p) => String(p._id) === String(sub?.planId));
    const classLevel = classes.find((c) => String(c._id) === String(user.classLevelId));
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      classLevelId: user.classLevelId?.toString(),
      classTitle: classLevel?.title ?? null,
      subscriptionStatus: sub?.status ?? "NONE",
      planName: plan?.name ?? null,
    };
  });

  res.json({ users: data });
});

router.post("/payments/:id/approve", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  await Payment.findByIdAndUpdate(payment._id, { status: "SUCCESS" });
  const currentPeriodEnd = addDays(new Date(), 30);
  await Subscription.findByIdAndUpdate(payment.subscriptionId, {
    status: "ACTIVE",
    currentPeriodEnd,
  });
  res.json({ status: "approved" });
});

router.post("/payments/:id/reject", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
  await Subscription.findByIdAndUpdate(payment.subscriptionId, { status: "CANCELED" });
  res.json({ status: "rejected" });
});

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default router;
