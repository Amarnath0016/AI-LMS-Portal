import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    education: { type: String, default: "" },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 1 },
    avatar: { type: String, default: "SC" },
    skills: [
      {
        name: { type: String },
        level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
      },
    ],
    preferences: {
      pace: { type: String, default: "Moderate" },
      delivery: { type: String, default: "Visual" },
      dailyGoal: { type: Number, default: 2 },
      timezone: { type: String, default: "IST (UTC+5:30)" },
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.Mixed }],
    wishlist: [{ type: mongoose.Schema.Types.Mixed }],
    lastActiveAt: { type: Date, default: Date.now },
    lastChallengeDate: { type: Date, default: null },
    unlockedHints: [
      {
        challengeId: { type: String, required: true },
        hintIndex: { type: Number, required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, default: "Active" },
    resetOtpHash: { type: String, default: null },
    resetOtpExpiresAt: { type: String, default: null },
    resetOtpUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
