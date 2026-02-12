import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectMongo } from "./lib/mongo";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import catalogRoutes from "./routes/catalog";
import subscriptionRoutes from "./routes/subscriptions";
import { requireAuth, type AuthRequest } from "./middleware/auth";
import { ClassLevel, SubscriptionPlan, User } from "./models";
import paymentsRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import uploadsRoutes from "./routes/uploads";

const app = express();
const port = Number(process.env.PORT ?? 8000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "4mb" }));


app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.json({});
});

app.get("/", (_req, res) => {
  const mongoState = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  } as const;
  const state = mongoState[mongoose.connection.readyState] ?? "unknown";
  res.json({
    status: "running",
    mongo: state,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.userId).lean();
  res.json({
    user: user
      ? {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          classLevelId: user.classLevelId?.toString(),
        }
      : null,
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/catalog", catalogRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/uploads", uploadsRoutes);

app.listen(port, async () => {
  await connectMongo();
  await ensureDefaults();
  console.log(`API running on http://localhost:${port}`);
});

const ensureDefaults = async () => {
  const classes = [
    { grade: "GRADE_8", title: "Class 8" },
    { grade: "GRADE_9", title: "Class 9" },
    { grade: "GRADE_10", title: "Class 10" },
  ] as const;

  for (const classLevel of classes) {
    await ClassLevel.findOneAndUpdate(
      { grade: classLevel.grade },
      { title: classLevel.title },
      { upsert: true, returnDocument: "after" }
    );
  }

  const plans = [
    {
      name: "Standard Learning",
      priceNpr: 499,
      billingCycle: "MONTHLY" as const,
      description: "Access to notes, model questions, and recorded videos.",
    },
    {
      name: "Live + Learning",
      priceNpr: 999,
      billingCycle: "MONTHLY" as const,
      description: "Everything in Standard, plus live sessions with tutors.",
    },
  ];

  for (const plan of plans) {
    await SubscriptionPlan.findOneAndUpdate(
      { name: plan.name },
      { priceNpr: plan.priceNpr, description: plan.description, billingCycle: plan.billingCycle },
      { upsert: true, returnDocument: "after" }
    );
  }
};
