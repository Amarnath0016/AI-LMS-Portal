import express from "express";
import {
  getForumPosts,
  getForumPostById,
  createForumPost,
  addForumComment,
  upvoteForumPost,
  deleteForumPost,
} from "../controllers/forumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getForumPosts);
router.get("/:id", getForumPostById);
router.post("/", protect, createForumPost);
router.post("/:id/comments", protect, addForumComment);
router.patch("/:id/upvote", protect, upvoteForumPost);
router.delete("/:id", protect, deleteForumPost);

export default router;
