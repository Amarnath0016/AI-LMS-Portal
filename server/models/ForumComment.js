import mongoose from "mongoose";

const forumCommentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "ForumPost", required: true, index: true },
    author: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.Mixed, required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

forumCommentSchema.index({ postId: 1, createdAt: 1 });

export default mongoose.models.ForumComment || mongoose.model("ForumComment", forumCommentSchema);
