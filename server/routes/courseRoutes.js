import express from "express";
import {
  getAllCourses,
  getCourseById,
  enrollCourse,
  updateCourseProgress,
  createCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/:id/enroll", protect, enrollCourse);
router.patch("/:id/progress", protect, updateCourseProgress);

// Instructor / Admin course creation route
router.post("/", protect, requireRole("instructor", "admin"), createCourse);

export default router;
