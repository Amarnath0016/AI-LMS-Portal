import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    title: { type: String, required: true },
    duration: { type: String, default: "15 min" },
    completed: { type: Boolean, default: false },
    script: { type: String, default: "" },
    text: { type: String, default: "" },
    transcript: { type: String, default: "" },
    pdfNotes: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    xpReward: { type: Number, default: 100 },
    attachments: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        mimetype: { type: String, default: "application/octet-stream" },
        size: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    quizQuestions: [
      {
        id: { type: mongoose.Schema.Types.Mixed },
        question: { type: String, required: true },
        options: [{ type: String }],
        correctAnswerIndex: { type: Number, default: 0 },
        explanation: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lessonSchema.index({ courseId: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
