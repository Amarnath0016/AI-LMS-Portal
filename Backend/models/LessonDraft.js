import mongoose from "mongoose";

const lessonDraftSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    instructorId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    mentorId: { type: mongoose.Schema.Types.Mixed, default: 1 },
    topic: { type: String, required: true },
    level: { type: String, default: "Beginner" },
    status: {
      type: String,
      enum: ["draft", "reviewed", "published", "archived"],
      default: "draft",
    },
    lessonData: {
      title: { type: String, required: true },
      objectives: [{ type: String }],
      scriptSegments: [
        {
          segmentNumber: { type: Number },
          heading: { type: String },
          narration: { type: String },
          durationSeconds: { type: Number },
        },
      ],
      quizQuestions: [
        {
          id: { type: Number },
          question: { type: String },
          options: [{ type: String }],
          correctAnswerIndex: { type: Number },
          explanation: { type: String },
        },
      ],
      practiceTask: {
        title: { type: String },
        instructions: { type: String },
        starterCode: { type: String, default: "" },
        hints: [{ type: String }],
      },
    },
    publishedLessonId: { type: mongoose.Schema.Types.Mixed, default: null },
    reviewedBy: { type: mongoose.Schema.Types.Mixed, default: null },
    reviewedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lessonDraftSchema.index({ courseId: 1, status: 1 });

export default mongoose.models.LessonDraft || mongoose.model("LessonDraft", lessonDraftSchema);
