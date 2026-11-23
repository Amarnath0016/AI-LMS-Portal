import express from "express";
import {
  getAdminUsers,
  inviteUser,
  updateUserStatus,
  deleteUser,
  approveCourse,
  rejectCourse,
  updateCourseAccess,
  getPlatformAnalytics,
  getInstructorApplications,
  approveInstructorApplication,
  rejectInstructorApplication,
  getAdminMentors,
  updateMentorStatus,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protect every admin route: requires valid authentication AND admin role
router.use(protect);
router.use(requireRole("admin"));

router.get("/users", getAdminUsers);
router.post("/users/invite", inviteUser);
router.patch("/users/:id", updateUserStatus);
router.delete("/users/:id", deleteUser);

router.patch("/courses/:id/approve", approveCourse);
router.patch("/courses/:id/reject", rejectCourse);
router.patch("/courses/:id/access", updateCourseAccess);

router.get("/analytics", getPlatformAnalytics);

// Instructor application review routes
router.get("/instructor-applications", getInstructorApplications);
router.patch("/instructor-applications/:id/approve", approveInstructorApplication);
router.patch("/instructor-applications/:id/reject", rejectInstructorApplication);

// Mentor management & consent activation routes
router.get("/mentors", getAdminMentors);
router.patch("/mentors/:id/status", updateMentorStatus);
router.patch("/mentors/:id/activate", updateMentorStatus);

export default router;
