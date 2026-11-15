import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    title: { type: String, required: true },
    duration: { type: String, default: "15 min" },
    completed: { type: Boolean, default: false },
    script: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    xpReward: { type: Number, default: 100 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lessonSchema.index({ courseId: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
