import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Test Case" },
    passed: { type: Boolean, required: true },
    expected: { type: mongoose.Schema.Types.Mixed },
    actual: { type: mongoose.Schema.Types.Mixed },
    error: { type: String, default: null },
    executionTimeMs: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
  },
  { _id: false }
);

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, default: "javascript" },
    passed: { type: Boolean, default: false, index: true },
    xpEarned: { type: Number, default: 0 },
    streakBonusEarned: { type: Number, default: 0 },
    results: [testResultSchema],
    submissionDate: { type: String, index: true }, // e.g. "YYYY-MM-DD"
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

challengeSubmissionSchema.index({ challengeId: 1, userId: 1, submissionDate: 1 });
challengeSubmissionSchema.index({ userId: 1, passed: 1 });

export default mongoose.models.ChallengeSubmission || mongoose.model("ChallengeSubmission", challengeSubmissionSchema);
