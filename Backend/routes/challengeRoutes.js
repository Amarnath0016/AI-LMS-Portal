import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import {
  getTodayChallenge,
  getChallengeById,
  getAllChallenges,
  runChallengeCode,
  submitChallengeCode,
  unlockChallengeHint,
} from "../controllers/challengeController.js";

const router = express.Router();

// Public / optionally authenticated routes
router.get("/today", optionalAuth, getTodayChallenge);
router.get("/", optionalAuth, getAllChallenges);
router.get("/:id", optionalAuth, getChallengeById);
router.post("/:id/run", runChallengeCode);

// Authenticated submission and hint unlocking
router.post("/:id/submit", protect, submitChallengeCode);
router.post("/:id/hints/:hintIndex/unlock", protect, unlockChallengeHint);

export default router;
