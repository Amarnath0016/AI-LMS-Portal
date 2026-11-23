import mongoose from "mongoose";
import crypto from "crypto";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true, index: true },
    courseIds: [{ type: mongoose.Schema.Types.Mixed }], // specific courses covered, or empty if plan covers all
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    paymentMode: { type: String, enum: ["demo", "razorpay"], default: "demo" },
    demoReference: {
      type: String,
      default: () => "DEMO-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    },
    // Store only name and email for billing records; NEVER store card numbers, CVV or expiry
    billingName: { type: String, required: true, trim: true },
    billingEmail: { type: String, required: true, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ expiresAt: 1, status: 1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
