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
    const posts = await ForumPost.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createForumPost = async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const author = req.user?.name || "Student Learner";
    const authorId = req.user?._id || req.user?.id || 1;

    const newPost = await ForumPost.create({
      title,
      category: category || "General",
      content,
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
    const author = req.user?.name || "Student Learner";
    const authorId = req.user?._id || req.user?.id || null;

    const post = await ForumPost.findOne(getPostQuery(id));
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const newComment = {
      author,
      authorId,
      content,
      timestamp: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Also persist in normalized ForumComment collection
    await ForumComment.create({
      postId: post._id,
      author,
      authorId,
      content,
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
