import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    name: { type: String, required: true },
    initials: { type: String, required: true },
    subject: { type: String, required: true },
    tag: { type: String, required: true },
    color: { type: String, default: "#1a1a2e" },
    accent: { type: String, default: "#2563EB" },
    students: { type: String, default: "10K" },
    rating: { type: Number, default: 5.0 },
    courses: { type: Number, default: 1 },
    voice: { type: String, default: "Calm tone" },
    voiceSettings: {
      pitch: { type: Number, default: 1.0 },
      rate: { type: Number, default: 1.0 },
      voiceName: { type: String, default: "default" },
      elevenVoiceId: { type: String, default: "" },
      tone: { type: String, default: "measured" },
    },
    bio: { type: String, default: "" },
    personaPrompt: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

mentorSchema.index({ tag: 1 });

export default mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
