import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Test Case" },
    input: { type: mongoose.Schema.Types.Mixed },
    expected: { type: mongoose.Schema.Types.Mixed },
    testCode: { type: String, default: "" },
    hidden: { type: Boolean, default: false },
  },
  { _id: true }
);

const hintSchema = new mongoose.Schema(
  {
    hint: { type: String, required: true },
    cost: { type: Number, default: 10 },
  },
  { _id: true }
);

const dailyChallengeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    category: { type: String, default: "General" },
    xpReward: { type: Number, default: 200 },
    streakBonus: { type: Number, default: 50 },
    description: { type: String, required: true },
    starterCode: { type: String, default: "" },
    functionName: { type: String, default: "solution" },
    testCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
    hints: [hintSchema],
    date: { type: String, index: true }, // e.g. "2026-07-19"
    participants: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

dailyChallengeSchema.index({ active: 1, date: -1 });

export default mongoose.models.DailyChallenge || mongoose.model("DailyChallenge", dailyChallengeSchema);
