import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: Number, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    leagueId: { type: Number, required: true },
    partId: { type: Number, required: true },
    title: { type: String, required: true },
    questions: [questionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

quizSchema.index({ leagueId: 1, partId: 1 }, { unique: true });

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
