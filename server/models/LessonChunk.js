import mongoose from "mongoose";

const lessonChunkSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.Mixed, required: true },
    lessonTitle: { type: String, required: true },
    sectionTitle: { type: String, default: "Teaching Content" },
    contentType: {
      type: String,
      enum: ["text", "transcript", "pdfNotes", "script"],
      default: "text",
    },
    text: { type: String, required: true },
    tokenCount: { type: Number, default: 0 },
    embedding: [{ type: Number }], // Dense vector embedding
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

lessonChunkSchema.index({ courseId: 1, lessonId: 1 });
lessonChunkSchema.index({ courseId: 1, sectionTitle: 1 });

export default mongoose.models.LessonChunk || mongoose.model("LessonChunk", lessonChunkSchema);
