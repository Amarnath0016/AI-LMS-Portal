import express from "express";
import {
  getForumPosts,
  createForumPost,
  addForumComment,
  upvoteForumPost,
} from "../controllers/forumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getForumPosts);
router.post("/", protect, createForumPost);
router.post("/:id/comments", protect, addForumComment);
router.patch("/:id/upvote", protect, upvoteForumPost);

export default router;
