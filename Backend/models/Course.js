import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const quizQuestionItemSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, default: 0 },
    explanation: { type: String, default: "" },
  },
  { _id: true }
);

const lessonItemSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    moduleId: { type: mongoose.Schema.Types.Mixed },
    moduleTitle: { type: String, default: "" },
    title: { type: String, required: true },
    duration: { type: String, default: "15 min" },
    completed: { type: Boolean, default: false },
    script: { type: String, default: "" },
    text: { type: String, default: "" },
    transcript: { type: String, default: "" },
    pdfNotes: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    attachments: [attachmentSchema],
    quizQuestions: [quizQuestionItemSchema],
  },
  { _id: true }
);

const moduleItemSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
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
    accessType: { type: String, enum: ["free", "paid"], default: "free", index: true },
    price: { type: Number, default: 0 },
    subscriptionPlanIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan" }],
    tag: { type: String, required: true },
    enrolled: { type: String, default: "0K" },
    xp: { type: Number, default: 1000 },
    league: { type: String, required: true },
    description: { type: String, required: true },
    modules: [moduleItemSchema],
    lessons: [lessonItemSchema],
    instructorId: { type: mongoose.Schema.Types.Mixed, index: true },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    // Admin Review & Approval Audit
    reviewerId: { type: mongoose.Schema.Types.Mixed },
    reviewerEmail: { type: String, default: "" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
    reviewFeedback: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

courseSchema.index({ tag: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ instructorId: 1, status: 1 });

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
