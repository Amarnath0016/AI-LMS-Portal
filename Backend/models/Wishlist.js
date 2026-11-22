import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    addedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

wishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
