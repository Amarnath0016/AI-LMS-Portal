import mongoose from "mongoose";

const instructorApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subjects: { type: String, default: "General" },
    experience: { type: String, default: "" },
    bio: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

instructorApplicationSchema.index({ userId: 1, status: 1 });

export default mongoose.models.InstructorApplication || mongoose.model("InstructorApplication", instructorApplicationSchema);
