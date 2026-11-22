import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    id: { type: String },
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    courseId: { type: mongoose.Schema.Types.Mixed, required: true },
    title: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) },
    mentor: { type: String, default: "" },
    verificationCode: { type: String, required: true, unique: true },
    grade: { type: String, default: "A+" },
    league: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);
