import mongoose from "mongoose";

const embeddedCommentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.Mixed },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const forumPostSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    category: { type: String, default: "General", index: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.Mixed }],
    comments: [embeddedCommentSchema],
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

forumPostSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.ForumPost || mongoose.model("ForumPost", forumPostSchema);
