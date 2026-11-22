import express from "express";
import { getLeagues, getMyQuizAttempts, getQuiz, submitQuizAttempt } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/leagues", getLeagues);
router.get("/my-attempts", protect, getMyQuizAttempts);
router.get("/:leagueId/:partId", getQuiz);
router.post("/:id/submit", protect, submitQuizAttempt);
router.post("/submit", protect, submitQuizAttempt);

export default router;
