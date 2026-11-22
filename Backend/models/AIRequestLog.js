import mongoose from "mongoose";

const aiRequestLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    endpoint: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.Mixed, default: null },
    mentorId: { type: mongoose.Schema.Types.Mixed, default: null },
    tokensUsed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["success", "refusal", "quota_exceeded", "error", "unavailable"],
      default: "success",
    },
    date: {
      type: String,
      required: true,
      index: true,
      default: () => new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    },
    latencyMs: { type: Number, default: 0 },
    // Strictly NO PII: no student name, email, password, IP address, or sensitive chat contents
    metadata: {
      model: { type: String, default: "" },
      hasCitations: { type: Boolean, default: false },
      citationCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

aiRequestLogSchema.index({ userId: 1, date: 1, status: 1 });

export default mongoose.models.AIRequestLog || mongoose.model("AIRequestLog", aiRequestLogSchema);
