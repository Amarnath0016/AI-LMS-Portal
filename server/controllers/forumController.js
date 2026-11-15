import mongoose from "mongoose";
import ForumPost from "../models/ForumPost.js";
import ForumComment from "../models/ForumComment.js";

const getPostQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getForumPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { content: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const posts = await ForumPost.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getForumPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ForumPost.findOne(getPostQuery(id));
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    return res.json({ success: true, data: post });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createForumPost = async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    const author = req.user?.name || "Student Learner";
    const authorId = req.user?._id || req.user?.id || 1;

    const newPost = await ForumPost.create({
      title: title.trim(),
      category: category || "General",
      content: content.trim(),
      author,
      authorId,
      upvotes: 0,
      comments: [],
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    });

    return res.status(201).json({ success: true, message: "Discussion posted.", data: newPost });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addForumComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required." });
    }

    const author = req.user?.name || "Student Learner";
    const authorId = req.user?._id || req.user?.id || null;

    const post = await ForumPost.findOne(getPostQuery(id));
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const newComment = {
      author,
      authorId,
      content: content.trim(),
      timestamp: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Persist in normalized collection
    await ForumComment.create({
      postId: post._id,
      author,
      authorId,
      content: content.trim(),
      timestamp: newComment.timestamp,
    });

    return res.json({ success: true, message: "Reply added.", data: post.comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const upvoteForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ForumPost.findOneAndUpdate(
      getPostQuery(id),
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    return res.json({ success: true, upvotes: post.upvotes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ForumPost.findOne(getPostQuery(id));

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    // Ownership check: only author or admin can delete
    const isOwner = String(post.authorId) === String(req.user?._id || req.user?.id);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this discussion.",
      });
    }

    await ForumPost.findByIdAndDelete(post._id);
    await ForumComment.deleteMany({ postId: post._id });

    return res.json({ success: true, message: "Discussion deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
