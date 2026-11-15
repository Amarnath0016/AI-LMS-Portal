import express from "express";
import { getQuiz, submitQuizAttempt } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:leagueId/:partId", getQuiz);
router.post("/submit", protect, submitQuizAttempt);

export default router;
