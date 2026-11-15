import mongoose from "mongoose";

const lessonItemSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    title: { type: String, required: true },
    duration: { type: String, default: "15 min" },
    completed: { type: Boolean, default: false },
    script: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    title: { type: String, required: true },
    mentorId: { type: mongoose.Schema.Types.Mixed, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    duration: { type: String, default: "10h" },
    price: { type: Number, default: 0 },
    tag: { type: String, required: true },
    enrolled: { type: String, default: "0K" },
    xp: { type: Number, default: 1000 },
    league: { type: String, required: true },
    description: { type: String, required: true },
    lessons: [lessonItemSchema],
    instructorId: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.index({ tag: 1 });
courseSchema.index({ status: 1 });

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
