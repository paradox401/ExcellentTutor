import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { Subscription, SubscriptionPlan, Payment } from "../models";

const router = Router();

const initiateSchema = z.object({
  planId: z.string().min(6),
});

router.post("/khalti/initiate", requireAuth, async (req: AuthRequest, res) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }

  const plan = await SubscriptionPlan.findById(parsed.data.planId).lean();
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  const { subscription, payment } = await createPendingPayment({
    userId: req.auth!.userId,
    planId: plan._id.toString(),
    amount: plan.priceNpr,
    provider: "KHALTI",
  });

  const khaltiSecret = process.env.KHALTI_SECRET_KEY;
  const serverUrl = process.env.SERVER_URL ?? "http://localhost:8000";
  const websiteUrl = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  const khaltiBase = process.env.KHALTI_BASE_URL ?? "https://khalti.com/api/v2";

  if (!khaltiSecret) {
    return res.status(500).json({ message: "Khalti is not configured" });
  }

  const payload = {
    return_url: `${serverUrl}/api/v1/payments/khalti/callback`,
    website_url: websiteUrl,
    amount: plan.priceNpr * 100,
    purchase_order_id: payment._id.toString(),
    purchase_order_name: plan.name,
  };

  const response = await fetch(`${khaltiBase}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${khaltiSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
    return res.status(400).json({ message: data?.detail ?? "Khalti initiate failed" });
  }

  await Payment.findByIdAndUpdate(payment._id, { referenceId: data.pidx });

  res.json({
    paymentUrl: data.payment_url,
    pidx: data.pidx,
    subscriptionId: subscription._id,
  });
});

router.get("/khalti/callback", async (req, res) => {
  const pidx = String(req.query.pidx ?? "");
  if (!pidx) {
    return res.status(400).send("Missing pidx");
  }

  const khaltiSecret = process.env.KHALTI_SECRET_KEY;
  const khaltiBase = process.env.KHALTI_BASE_URL ?? "https://khalti.com/api/v2";
  const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  if (!khaltiSecret) {
    return res.status(500).send("Khalti not configured");
  }

  const lookupResponse = await fetch(`${khaltiBase}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${khaltiSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const lookup = await lookupResponse.json();
  const payment = await Payment.findOne({ referenceId: pidx });
  if (!payment) {
    return res.redirect(`${clientOrigin}/dashboard?payment=notfound`);
  }

  if (lookup.status === "Completed") {
    await Payment.findByIdAndUpdate(payment._id, { status: "SUCCESS" });
    await Subscription.findByIdAndUpdate(payment.subscriptionId, { status: "ACTIVE" });
    return res.redirect(`${clientOrigin}/dashboard?payment=success`);
  }

  await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
  return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
});

router.post("/esewa/initiate", requireAuth, async (req: AuthRequest, res) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }

  const plan = await SubscriptionPlan.findById(parsed.data.planId).lean();
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  const { subscription, payment } = await createPendingPayment({
    userId: req.auth!.userId,
    planId: plan._id.toString(),
    amount: plan.priceNpr,
    provider: "ESEWA",
  });

  const serverUrl = process.env.SERVER_URL ?? "http://localhost:8000";
  const productCode = process.env.ESEWA_MERCHANT_CODE;
  const secret = process.env.ESEWA_SECRET_KEY;
  const formUrl = process.env.ESEWA_FORM_URL ?? "https://epay.esewa.com.np/api/epay/main/v2/form";

  if (!productCode || !secret) {
    return res.status(500).json({ message: "eSewa is not configured" });
  }

  const transactionUuid = payment._id.toString();
  const totalAmount = plan.priceNpr.toFixed(2);

  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const dataToSign = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64");

  await Payment.findByIdAndUpdate(payment._id, { referenceId: transactionUuid });

  res.json({
    formUrl,
    fields: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${serverUrl}/api/v1/payments/esewa/callback`,
      failure_url: `${serverUrl}/api/v1/payments/esewa/failure`,
      signed_field_names: signedFieldNames,
      signature,
    },
  });
});

router.post("/manual/request", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    planId: z.string().min(6),
    note: z.string().optional(),
    proofUrl: z.string().url().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
  }

  const plan = await SubscriptionPlan.findById(parsed.data.planId).lean();
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  const { subscription, payment } = await createPendingPayment({
    userId: req.auth!.userId,
    planId: plan._id.toString(),
    amount: plan.priceNpr,
    provider: "MANUAL",
  });

  await Payment.findByIdAndUpdate(payment._id, {
    note: parsed.data.note,
    proofUrl: parsed.data.proofUrl,
  });

  res.status(201).json({ paymentId: payment._id, subscriptionId: subscription._id });
});

router.get("/manual/me", requireAuth, async (req: AuthRequest, res) => {
  const subscriptions = await Subscription.find({ userId: req.auth!.userId })
    .select("_id")
    .lean();
  const subscriptionIds = subscriptions.map((sub) => sub._id);
  const payments = await Payment.find({
    provider: "MANUAL",
    status: "PENDING",
    subscriptionId: { $in: subscriptionIds },
  }).lean();

  res.json({ payments });
});

router.get("/esewa/callback", async (req, res) => {
  const payload = String(req.query.data ?? "");
  if (!payload) {
    return res.status(400).send("Missing data");
  }

  const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  const secret = process.env.ESEWA_SECRET_KEY ?? "";
  const decoded = Buffer.from(payload, "base64").toString("utf-8");

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
  }

  const signedFieldNames = parsed.signed_field_names ?? "";
  const signature = parsed.signature ?? "";
  const fields = signedFieldNames
    .split(",")
    .map((name) => `${name}=${parsed[name] ?? ""}`)
    .join(",");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(fields)
    .digest("base64");

  if (signature !== expectedSignature) {
    return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
  }

  const transactionUuid = parsed.transaction_uuid;
  const payment = await Payment.findOne({ referenceId: transactionUuid });
  if (!payment) {
    return res.redirect(`${clientOrigin}/dashboard?payment=notfound`);
  }

  if (parsed.status === "COMPLETE") {
    const statusUrl =
      process.env.ESEWA_STATUS_URL ??
      "https://epay.esewa.com.np/api/epay/transaction/status/";
    try {
      const statusResponse = await fetch(
        `${statusUrl}?product_code=${parsed.product_code}&total_amount=${parsed.total_amount}&transaction_uuid=${parsed.transaction_uuid}`
      );
      const statusData = await statusResponse.json();
      if (statusData?.status !== "COMPLETE") {
        await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
        return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
      }
    } catch {
      await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
      return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
    }

    await Payment.findByIdAndUpdate(payment._id, { status: "SUCCESS" });
    await Subscription.findByIdAndUpdate(payment.subscriptionId, { status: "ACTIVE" });
    return res.redirect(`${clientOrigin}/dashboard?payment=success`);
  }

  await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
  return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
});

router.get("/esewa/failure", async (_req, res) => {
  const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
  return res.redirect(`${clientOrigin}/dashboard?payment=failed`);
});

const createPendingPayment = async ({
  userId,
  planId,
  amount,
  provider,
}: {
  userId: string;
  planId: string;
  amount: number;
  provider: "KHALTI" | "ESEWA" | "MANUAL";
}) => {
  const currentPeriodEnd = addDays(new Date(), 30);
  const subscription = await Subscription.create({
    userId,
    planId,
    status: "PAST_DUE",
    currentPeriodEnd,
  });

  const payment = await Payment.create({
    subscriptionId: subscription._id,
    provider,
    amountNpr: amount,
    status: "PENDING",
  });

  return { subscription, payment };
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default router;
