import express from "express";
import {
  getAllCourses,
  getCourseById,
  enrollCourse,
  updateCourseProgress,
  getMyEnrollments,
  completeLesson,
  createCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/me/enrollments", protect, getMyEnrollments);
router.get("/:id", getCourseById);
router.post("/:id/enroll", protect, enrollCourse);
router.patch("/:id/progress", protect, updateCourseProgress);
router.post("/lessons/:id/complete", protect, completeLesson);

// Instructor / Admin course creation route
router.post("/", protect, requireRole("instructor", "admin"), createCourse);

export default router;
