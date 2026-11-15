import express from "express";
import {
  getAdminUsers,
  inviteUser,
  updateUserStatus,
  deleteUser,
  approveCourse,
  rejectCourse,
  getPlatformAnalytics,
  getInstructorApplications,
  approveInstructorApplication,
  rejectInstructorApplication,
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

router.get("/analytics", getPlatformAnalytics);

// Instructor application review routes
router.get("/instructor-applications", getInstructorApplications);
router.patch("/instructor-applications/:id/approve", approveInstructorApplication);
router.patch("/instructor-applications/:id/reject", rejectInstructorApplication);

export default router;
