import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    difficulty: { type: String, default: "Medium" },
    category: { type: String, default: "General" },
    xpReward: { type: Number, default: 200 },
    streakBonus: { type: Number, default: 50 },
    description: { type: String, required: true },
    starterCode: { type: String, default: "" },
    testCases: [
      {
        input: { type: String },
        expected: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.models.DailyChallenge || mongoose.model("DailyChallenge", dailyChallengeSchema);
