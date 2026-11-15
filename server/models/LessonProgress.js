import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.Mixed, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export default mongoose.models.LessonProgress || mongoose.model("LessonProgress", lessonProgressSchema);
