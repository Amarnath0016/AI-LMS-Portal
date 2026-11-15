import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { uploadLessonMaterial } from "../middleware/uploadMiddleware.js";
import {
  getInstructorDashboard,
  getInstructorCourses,
  getInstructorCourseById,
  createInstructorCourse,
  updateInstructorCourse,
  deleteInstructorCourse,
  submitCourseForReview,
  addCourseModule,
  updateCourseModule,
  deleteCourseModule,
  reorderCourseModules,
  addCourseLesson,
  updateCourseLesson,
  deleteCourseLesson,
  reorderCourseLessons,
  uploadLessonAttachment,
  deleteLessonAttachment,
  downloadLessonAttachment,
} from "../controllers/instructorController.js";

const router = express.Router();

// Public/enrolled file download route (protect handles auth, controller checks enrollment/ownership)
router.get("/courses/:id/lessons/:lessonId/attachments/:filename", protect, downloadLessonAttachment);

// Require instructor or admin role for all management routes
router.use(protect);
router.use(requireRole("instructor", "admin"));

// Dashboard & Analytics
router.get("/dashboard", getInstructorDashboard);

// Course Management
router.get("/courses", getInstructorCourses);
router.post("/courses", createInstructorCourse);
router.get("/courses/:id", getInstructorCourseById);
router.patch("/courses/:id", updateInstructorCourse);
router.delete("/courses/:id", deleteInstructorCourse);
router.post("/courses/:id/submit", submitCourseForReview);

// Module Management
router.post("/courses/:id/modules", addCourseModule);
router.patch("/courses/:id/modules/:moduleId", updateCourseModule);
router.delete("/courses/:id/modules/:moduleId", deleteCourseModule);
router.patch("/courses/:id/modules-reorder", reorderCourseModules);

// Lesson Management
router.post("/courses/:id/lessons", addCourseLesson);
router.patch("/courses/:id/lessons/:lessonId", updateCourseLesson);
router.delete("/courses/:id/lessons/:lessonId", deleteCourseLesson);
router.patch("/courses/:id/lessons-reorder", reorderCourseLessons);

// File Upload for Lesson Materials (Stored outside web root)
router.post(
  "/courses/:id/lessons/:lessonId/attachments",
  uploadLessonMaterial.single("file"),
  uploadLessonAttachment
);
router.delete(
  "/courses/:id/lessons/:lessonId/attachments/:attachmentId",
  deleteLessonAttachment
);

export default router;
