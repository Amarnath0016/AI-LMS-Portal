import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

moduleSchema.index({ courseId: 1, order: 1 });

export default mongoose.models.Module || mongoose.model("Module", moduleSchema);
