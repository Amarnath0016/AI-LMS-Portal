import express from "express";
import {
  handleMentorChat,
  handleLectureGeneration,
  handleCodeEvaluation,
  handleGetVoiceProfile,
  handleGetAvatarConfig,
  handleSynthesizeAudio,
} from "../controllers/aiMentorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, handleMentorChat);
router.post("/generate-lecture", protect, handleLectureGeneration);
router.post("/evaluate-code", protect, handleCodeEvaluation);
router.get("/voice-profile/:mentorId", handleGetVoiceProfile);
router.get("/avatar-config/:mentorId", handleGetAvatarConfig);
router.post("/synthesize-audio", protect, handleSynthesizeAudio);

export default router;
