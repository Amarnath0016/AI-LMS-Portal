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
      voiceName: { type: String, default: "en-US-Neural2-D" },
      elevenVoiceId: { type: String, default: "" },
      tone: { type: String, default: "measured" },
      provider: { type: String, enum: ["google-tts", "elevenlabs", "web-speech"], default: "google-tts" },
      isLicensedClone: { type: Boolean, default: false },
      consentNotice: {
        type: String,
        default: "Authorized pedagogical voice profile with verified educational consent.",
      },
      voiceKeyword: { type: String, default: "Google US English" },
    },
    bio: { type: String, default: "" },
    personaPrompt: { type: String, required: true },
    styleDescription: { type: String, default: "" },
    vocabulary: [{ type: String }],
    teachingStyle: { type: String, default: "" },
    aiDisclaimer: { type: String, default: "AI-generated mentor inspired by public teaching philosophy." },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

mentorSchema.index({ tag: 1 });

export default mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
