import { Router } from "express";
import { z } from "zod";
import { SubscriptionPlan, Subscription, Payment } from "../models";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

const subscribeSchema = z.object({
  planId: z.string().min(1),
  provider: z.enum(["KHALTI", "ESEWA", "MANUAL"]),
});

router.get("/plans", async (_req, res) => {
  const plans = await SubscriptionPlan.find().sort({ priceNpr: 1 }).lean();
  res.json({ plans });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const subscription = await Subscription.findOne({
    userId: req.auth!.userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!subscription) {
    return res.json({ subscription: null });
  }

  if (
    subscription.status === "ACTIVE" &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() < Date.now()
  ) {
    await Subscription.findByIdAndUpdate(subscription._id, { status: "EXPIRED" });
    subscription.status = "EXPIRED";
  }

  const plan = await SubscriptionPlan.findById(subscription.planId).lean();

  res.json({ subscription: { ...subscription, plan } });
});

router.post("/subscribe", requireAuth, async (req: AuthRequest, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }

  const plan = await SubscriptionPlan.findById(parsed.data.planId).lean();

  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  const currentPeriodEnd = addDays(new Date(), 30);

  const subscription = await Subscription.create({
    userId: req.auth!.userId,
    planId: plan._id,
    currentPeriodEnd,
    status: "PAST_DUE",
  });

  const payment = await Payment.create({
    subscriptionId: subscription._id,
    provider: parsed.data.provider,
    amountNpr: plan.priceNpr,
    status: "PENDING",
  });

  res.status(201).json({
    subscription: { ...subscription.toObject(), plan },
    payment,
    nextSteps:
      "Payment initiated. Confirm payment to activate access.",
  });
});

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default router;
