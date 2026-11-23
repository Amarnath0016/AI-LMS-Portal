import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    isPaid: { type: Boolean, default: false },
    paymentConfirmed: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
