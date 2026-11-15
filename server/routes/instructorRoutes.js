import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import Course from "../models/Course.js";

const router = express.Router();

// Apply protect and requireRole("instructor", "admin") across all instructor routes
router.use(protect);
router.use(requireRole("instructor", "admin"));

router.get("/dashboard", async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : {
            $or: [
              { instructorId: req.user._id },
              { instructorId: req.user.id },
              { mentorId: req.user._id },
              { mentorId: req.user.id },
            ],
          };

    const myCourses = await Course.find(filter);

    return res.json({
      success: true,
      data: {
        totalCourses: myCourses.length,
        approvedCourses: myCourses.filter((c) => c.status === "approved").length,
        pendingCourses: myCourses.filter((c) => c.status === "pending").length,
        courses: myCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : {
            $or: [
              { instructorId: req.user._id },
              { instructorId: req.user.id },
              { mentorId: req.user._id },
              { mentorId: req.user.id },
            ],
          };

    const myCourses = await Course.find(filter);
    return res.json({ success: true, count: myCourses.length, data: myCourses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
