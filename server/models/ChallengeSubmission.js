import mongoose from "mongoose";

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challengeId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, default: "javascript" },
    passed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

challengeSubmissionSchema.index({ challengeId: 1, userId: 1 });

export default mongoose.models.ChallengeSubmission || mongoose.model("ChallengeSubmission", challengeSubmissionSchema);
