import express from "express";
import {
  handleMentorChat,
  handleLessonAudioGeneration,
  handleLectureGeneration,
  handleGetLessonDrafts,
  handlePublishLessonDraft,
  handleCodeEvaluation,
  handleGetVoiceProfile,
  handleGetAvatarConfig,
  handleSynthesizeAudio,
} from "../controllers/aiMentorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Chat with AI Mentor (authenticated students, instructors, admins)
router.post("/chat", protect, handleMentorChat);

// Lesson real TTS audio generation per script segment with disk caching
router.post("/lessons/:lessonId/audio", protect, handleLessonAudioGeneration);

// Lesson generation: Instructors and Admins only
router.post(
  "/generate-lecture",
  protect,
  requireRole("instructor", "admin"),
  handleLectureGeneration
);

// Lesson drafts: Review and Publish workflow (NEVER auto-published)
router.get(
  "/courses/:courseId/drafts",
  protect,
  requireRole("instructor", "admin"),
  handleGetLessonDrafts
);

router.patch(
  "/drafts/:draftId/publish",
  protect,
  requireRole("instructor", "admin"),
  handlePublishLessonDraft
);

// Code evaluation & media profiles
router.post("/evaluate-code", protect, handleCodeEvaluation);
router.get("/voice-profile/:mentorId", handleGetVoiceProfile);
router.get("/avatar-config/:mentorId", handleGetAvatarConfig);
router.post("/synthesize-audio", protect, handleSynthesizeAudio);

export default router;
