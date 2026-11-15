import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    leagueId: { type: Number, required: true },
    partId: { type: Number, required: true },
    answers: { type: mongoose.Schema.Types.Mixed },
    score: { type: Number, required: true },
    maxQuestions: { type: Number, required: true },
    earnedXp: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    attemptedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizAttemptSchema.index({ userId: 1, leagueId: 1, partId: 1 });

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
