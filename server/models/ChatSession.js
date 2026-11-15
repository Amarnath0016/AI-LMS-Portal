import mongoose from "mongoose";

const messageItemSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "model", "mentor"], required: true },
    text: { type: String, required: true },
    citations: [{ type: String }],
    label: { type: String, default: "AI-generated mentor" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    courseId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    mentorId: { type: mongoose.Schema.Types.Mixed, default: 1 },
    messages: [messageItemSchema],
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

chatSessionSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.ChatSession || mongoose.model("ChatSession", chatSessionSchema);
