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
    avatarSettings: {
      avatarUrl: { type: String, default: "" },
      avatarType: {
        type: String,
        enum: ["svg-canvas-2d", "vector-animated", "static-portrait"],
        default: "svg-canvas-2d",
      },
      isLicensedAvatar: { type: Boolean, default: true },
      licenceType: {
        type: String,
        default: "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
      },
      consentNotice: {
        type: String,
        default: "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
      },
      modelConfig: {
        skinTone: { type: String, default: "#F5D0C5" },
        hairColor: { type: String, default: "#2C3E50" },
        accentColor: { type: String, default: "#2563EB" },
        suitColor: { type: String, default: "#1E293B" },
      },
    },
    personaPrompt: { type: String, required: true },
    styleDescription: { type: String, default: "" },
    vocabulary: [{ type: String }],
    teachingStyle: { type: String, default: "" },
    aiDisclaimer: { type: String, default: "AI-generated mentor. Not the real person." },
    // Ethical AI & Consent Architecture
    type: {
      type: String,
      enum: ["original", "licensed", "historical", "consented-person"],
      default: "original",
      required: true,
      index: true,
    },
    consentDocUrl: { type: String, default: "" },
    licenseInfo: { type: String, default: "" },
    disclosureText: {
      type: String,
      default: "AI-generated mentor. Not the real person.",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending-consent", "draft"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-validate hook: Enforce that mentors can only be active if consentDocUrl or licenseInfo is present
mentorSchema.pre("validate", function (next) {
  if (this.status === "active") {
    const hasConsent = Boolean(this.consentDocUrl && this.consentDocUrl.trim());
    const hasLicense = Boolean(this.licenseInfo && this.licenseInfo.trim());
    if (!hasConsent && !hasLicense) {
      this.invalidate(
        "status",
        "Admin can only activate a mentor if consentDocUrl or licenseInfo is present."
      );
    }
  }
  next();
});

mentorSchema.index({ tag: 1 });

export default mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
