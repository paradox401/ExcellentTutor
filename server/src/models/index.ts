import mongoose, { Schema } from "mongoose";

const roleValues = ["STUDENT", "ADMIN"] as const;
const gradeValues = ["GRADE_8", "GRADE_9", "GRADE_10"] as const;
const billingValues = ["MONTHLY"] as const;
const subscriptionStatusValues = ["ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED"] as const;
const paymentProviderValues = ["KHALTI", "ESEWA", "MANUAL"] as const;
const paymentStatusValues = ["PENDING", "SUCCESS", "FAILED"] as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roleValues, default: "STUDENT" },
    classLevelId: { type: Schema.Types.ObjectId, ref: "ClassLevel" },
  },
  { timestamps: true }
);

const ClassLevelSchema = new Schema(
  {
    grade: { type: String, enum: gradeValues, unique: true, required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    classLevelId: { type: Schema.Types.ObjectId, ref: "ClassLevel", required: true },
  },
  { timestamps: true }
);

const ModuleSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

const MaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
  },
  { timestamps: true }
);

const VideoSchema = new Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    chapters: [
      {
        label: { type: String, required: true },
        time: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const QuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
  },
  { timestamps: true }
);

const LiveSessionSchema = new Schema(
  {
    title: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    meetingUrl: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

const EnrollmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const SubscriptionPlanSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    priceNpr: { type: Number, required: true },
    billingCycle: { type: String, enum: billingValues, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    status: { type: String, enum: subscriptionStatusValues, default: "ACTIVE" },
    currentPeriodEnd: { type: Date, required: true },
  },
  { timestamps: true }
);

const PaymentSchema = new Schema(
  {
    subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    provider: { type: String, enum: paymentProviderValues, required: true },
    amountNpr: { type: Number, required: true },
    status: { type: String, enum: paymentStatusValues, default: "PENDING" },
    referenceId: { type: String },
    note: { type: String },
    proofUrl: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User ?? mongoose.model("User", UserSchema);
export const ClassLevel =
  mongoose.models.ClassLevel ?? mongoose.model("ClassLevel", ClassLevelSchema);
export const Course = mongoose.models.Course ?? mongoose.model("Course", CourseSchema);
export const Module = mongoose.models.Module ?? mongoose.model("Module", ModuleSchema);
export const Material =
  mongoose.models.Material ?? mongoose.model("Material", MaterialSchema);
export const Video = mongoose.models.Video ?? mongoose.model("Video", VideoSchema);
export const Question =
  mongoose.models.Question ?? mongoose.model("Question", QuestionSchema);
export const LiveSession =
  mongoose.models.LiveSession ?? mongoose.model("LiveSession", LiveSessionSchema);
export const Enrollment =
  mongoose.models.Enrollment ?? mongoose.model("Enrollment", EnrollmentSchema);
export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ??
  mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
export const Subscription =
  mongoose.models.Subscription ?? mongoose.model("Subscription", SubscriptionSchema);
export const Payment = mongoose.models.Payment ?? mongoose.model("Payment", PaymentSchema);
