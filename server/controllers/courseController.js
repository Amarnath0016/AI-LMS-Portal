import mongoose from "mongoose";
import Course from "../models/Course.js";
import Mentor from "../models/Mentor.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import LessonProgress from "../models/LessonProgress.js";
import Wishlist from "../models/Wishlist.js";
import Notification from "../models/Notification.js";
import { computeUpdatedStreak } from "../utils/streakUtils.js";
import { issueCertificateIfEligible } from "../utils/certificateUtils.js";

const getCourseQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

const getMentorQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getAllCourses = async (req, res) => {
  try {
    const { tag, level, search, status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = "approved";
    }

    if (tag && tag !== "All") {
      filter.tag = { $regex: new RegExp(`^${tag}$`, "i") };
    }

    if (level && level !== "All") {
      filter.level = { $regex: new RegExp(`^${level}$`, "i") };
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { tag: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    // Attach mentor metadata for frontend convenience
    const allMentors = await Mentor.find();
    const mentorMap = new Map();
    for (const m of allMentors) {
      mentorMap.set(String(m._id), m);
      if (m.id !== undefined) mentorMap.set(String(m.id), m);
    }

    const enhancedCourses = courses.map((c) => {
      const courseObj = c.toObject();
      courseObj.mentor = mentorMap.get(String(c.mentorId)) || null;
      return courseObj;
    });

    return res.json({ success: true, count: enhancedCourses.length, data: enhancedCourses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    let mentor = null;
    if (course.mentorId) {
      mentor = await Mentor.findOne(getMentorQuery(course.mentorId));
    }

    const courseObj = course.toObject();

    return res.json({
      success: true,
      data: {
        ...courseObj,
        mentor: mentor ? mentor.toObject() : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Requirement: checks course exists and approved
    if (course.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll: Course is pending administrator approval.",
      });
    }

    // Requirement: payment / free check
    const { paymentConfirmed, isPaid, paymentDetails } = req.body || {};
    if (course.price > 0 && !paymentConfirmed && !isPaid && !paymentDetails) {
      return res.status(402).json({
        success: false,
        message: `Payment required: Course enrollment fee is ${course.price}.`,
        price: course.price,
      });
    }

    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Upsert Enrollment record
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: user._id, courseId: course._id },
      {
        $setOnInsert: {
          userId: user._id,
          courseId: course._id,
          enrolledAt: new Date(),
          progress: 0,
          completed: false,
        },
      },
      { upsert: true, new: true }
    );

    // Keep user.enrolledCourses in sync
    const identifier = course.id !== undefined ? course.id : course._id;
    if (!user.enrolledCourses.some((c) => String(c) === String(identifier) || String(c) === String(course._id))) {
      user.enrolledCourses.push(identifier);
    }

    // Clean up wishlist if wishlisted
    await Wishlist.deleteOne({ userId: user._id, courseId: course._id });
    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(
        (c) => String(c) !== String(identifier) && String(c) !== String(course._id)
      );
    }
    await user.save();

    // Create In-App Notification
    await Notification.create({
      userId: user._id,
      title: "Enrolled in Course 🎓",
      message: `You have successfully enrolled in "${course.title}". Start with module 1 now!`,
      type: "info",
      link: `/courses/${course.id || course._id}`,
    });

    return res.status(200).json({
      success: true,
      message: `Enrolled in "${course.title}" successfully!`,
      courseId: course.id || course._id,
      enrollment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const enrollments = await Enrollment.find({ userId }).sort({ enrolledAt: -1 });

    const allCourses = await Course.find();
    const allMentors = await Mentor.find();

    const courseMap = new Map();
    for (const c of allCourses) {
      courseMap.set(String(c._id), c);
      if (c.id !== undefined) courseMap.set(String(c.id), c);
    }

    const mentorMap = new Map();
    for (const m of allMentors) {
      mentorMap.set(String(m._id), m);
      if (m.id !== undefined) mentorMap.set(String(m.id), m);
    }

    const data = enrollments.map((enr) => {
      const course = courseMap.get(String(enr.courseId));
      let mentor = null;
      if (course?.mentorId) {
        mentor = mentorMap.get(String(course.mentorId)) || null;
      }
      return {
        _id: enr._id,
        id: enr.id,
        progress: enr.progress,
        completed: enr.completed,
        enrolledAt: enr.enrolledAt,
        courseId: enr.courseId,
        course: course ? { ...course.toObject(), mentor } : null,
      };
    });

    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const { id } = req.params; // lessonId
    const { courseId: explicitCourseId } = req.body || {};
    const userId = req.user._id || req.user.id;

    // Find course containing this lesson or matching explicitCourseId
    let course = null;
    if (explicitCourseId) {
      course = await Course.findOne(getCourseQuery(explicitCourseId));
    }
    if (!course) {
      course = await Course.findOne({
        $or: [
          { "lessons._id": mongoose.Types.ObjectId.isValid(id) ? id : null },
          { "lessons.id": isNaN(id) ? id : Number(id) },
        ],
      });
    }

    if (!course) {
      return res.status(404).json({ success: false, message: "Associated course for lesson not found." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if lesson was already completed by this user (Idempotent requirement)
    const existingProgress = await LessonProgress.findOne({
      userId: user._id,
      courseId: course._id,
      lessonId: id,
      completed: true,
    });

    const totalLessons = course.lessons?.length || 1;

    if (existingProgress) {
      const currentEnrollment = await Enrollment.findOne({ userId: user._id, courseId: course._id });
      return res.json({
        success: true,
        message: "Lesson was already completed.",
        progress: currentEnrollment?.progress || 100,
        completed: true,
        alreadyCompleted: true,
        earnedXp: 0,
        xpAwarded: 0,
      });
    }

    // Mark lesson progress completed
    await LessonProgress.findOneAndUpdate(
      { userId: user._id, courseId: course._id, lessonId: id },
      {
        $set: {
          userId: user._id,
          courseId: course._id,
          lessonId: id,
          completed: true,
          progress: 100,
          completedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Compute progress % server-side from completed lessons
    const completedCount = await LessonProgress.countDocuments({
      userId: user._id,
      courseId: course._id,
      completed: true,
    });

    const computedProgress = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    const isCompleted = computedProgress === 100;

    // Update Enrollment
    await Enrollment.findOneAndUpdate(
      { userId: user._id, courseId: course._id },
      {
        $set: {
          progress: computedProgress,
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      },
      { upsert: true, new: true }
    );

    // Compute XP earned for lesson
    const xpReward = Math.round((course.xp || 1000) / totalLessons);
    user.xp = (user.xp || 0) + xpReward;

    // Update server-side streaks
    user.streak = computeUpdatedStreak(user.lastActiveAt, user.streak);
    user.lastActiveAt = new Date();
    await user.save();

    // Check if certificate should be issued
    let certificateIssued = false;
    if (isCompleted) {
      const certResult = await issueCertificateIfEligible(user._id, course._id);
      certificateIssued = Boolean(certResult.eligible && !certResult.alreadyIssued);
    }

    return res.json({
      success: true,
      message: `Lesson completed! +${xpReward} XP earned.`,
      progress: computedProgress,
      completedCount,
      totalLessons,
      earnedXp: xpReward,
      xpAwarded: xpReward,
      currentXp: user.xp,
      currentStreak: user.streak,
      certificateIssued,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourseProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { lessonId, progress, xpAward = 100 } = req.body;
    const course = await Course.findOne(getCourseQuery(id));

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);

    if (user) {
      const earnedXp = progress === 100 ? xpAward * 2 : xpAward;
      user.xp = (user.xp || 0) + earnedXp;
      user.streak = computeUpdatedStreak(user.lastActiveAt, user.streak);
      user.lastActiveAt = new Date();
      await user.save();

      // Track lesson progress
      if (lessonId !== undefined) {
        await LessonProgress.findOneAndUpdate(
          { userId: user._id, courseId: course._id, lessonId },
          {
            $set: {
              progress: Number(progress) || 0,
              completed: Number(progress) === 100,
              completedAt: Number(progress) === 100 ? new Date() : null,
            },
          },
          { upsert: true }
        );
      }

      // Update enrollment progress
      await Enrollment.findOneAndUpdate(
        { userId: user._id, courseId: course._id },
        {
          $set: {
            progress: Number(progress) || 0,
            completed: Number(progress) === 100,
            completedAt: Number(progress) === 100 ? new Date() : null,
          },
        },
        { upsert: true }
      );

      if (Number(progress) === 100) {
        await issueCertificateIfEligible(user._id, course._id);
      }
    }

    return res.json({
      success: true,
      message: "Progress updated successfully.",
      courseId: course.id !== undefined ? course.id : course._id,
      progress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const status = req.user?.role === "admin" ? "approved" : "pending";
    const newCourse = await Course.create({
      ...req.body,
      instructorId: req.user?._id || req.user?.id,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Course submitted for review.",
      data: newCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (
      req.user.role !== "admin" &&
      String(course.instructorId) !== String(req.user._id) &&
      String(course.instructorId) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this course.",
      });
    }

    Object.assign(course, req.body);
    await course.save();

    return res.json({ success: true, message: "Course updated.", data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (
      req.user.role !== "admin" &&
      String(course.instructorId) !== String(req.user._id) &&
      String(course.instructorId) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this course.",
      });
    }

    await Course.deleteOne(getCourseQuery(id));
    return res.json({ success: true, message: "Course deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Save audio playback resume position & auto-complete at >=90% watched.
 */
export const saveLessonPlaybackPosition = async (req, res) => {
  try {
    const { id } = req.params; // lessonId
    const { courseId, currentTime, progressPercent } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required." });
    }

    const isOid = mongoose.Types.ObjectId.isValid(courseId) && String(new mongoose.Types.ObjectId(courseId)) === String(courseId);
    const course = await Course.findOne(isOid ? { _id: courseId } : { id: Number(courseId) });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const playbackSec = Math.max(0, Number(currentTime) || 0);
    const pct = Math.min(100, Math.max(0, Number(progressPercent) || 0));
    const shouldMarkComplete = pct >= 90;

    const existingProgress = await LessonProgress.findOne({
      userId,
      courseId: course._id,
      lessonId: id,
    });

    const wasAlreadyCompleted = Boolean(existingProgress?.completed);
    const isNowCompleted = wasAlreadyCompleted || shouldMarkComplete;

    const progressDoc = await LessonProgress.findOneAndUpdate(
      { userId, courseId: course._id, lessonId: id },
      {
        $set: {
          playbackPositionSeconds: playbackSec,
          progress: isNowCompleted ? 100 : pct,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? (existingProgress?.completedAt || new Date()) : null,
        },
      },
      { upsert: true, new: true }
    );

    let enrollmentProgress = null;
    let earnedXp = 0;

    if (shouldMarkComplete && !wasAlreadyCompleted) {
      const totalLessons = course.lessons?.length || 1;
      const completedCount = await LessonProgress.countDocuments({
        userId,
        courseId: course._id,
        completed: true,
      });

      enrollmentProgress = Math.min(100, Math.round((completedCount / totalLessons) * 100));

      await Enrollment.findOneAndUpdate(
        { userId, courseId: course._id },
        {
          $set: {
            progress: enrollmentProgress,
            completed: enrollmentProgress === 100,
            completedAt: enrollmentProgress === 100 ? new Date() : null,
          },
        }
      );

      const user = await User.findById(userId);
      if (user) {
        earnedXp = 50;
        user.xp = (user.xp || 0) + earnedXp;
        user.streak = computeUpdatedStreak(user.lastActiveAt, user.streak);
        user.lastActiveAt = new Date();
        await user.save();
      }

      if (enrollmentProgress === 100) {
        await issueCertificateIfEligible(userId, course._id);
      }
    }

    return res.json({
      success: true,
      data: {
        lessonId: id,
        playbackPositionSeconds: playbackSec,
        progress: progressDoc.progress,
        completed: progressDoc.completed,
        earnedXp,
        courseProgress: enrollmentProgress,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get saved playback resume position for a lesson.
 */
export const getLessonPlaybackPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId } = req.query;
    const userId = req.user?._id || req.user?.id;

    const query = { userId, lessonId: id };
    if (courseId) {
      const isOid = mongoose.Types.ObjectId.isValid(courseId) && String(new mongoose.Types.ObjectId(courseId)) === String(courseId);
      const course = await Course.findOne(isOid ? { _id: courseId } : { id: Number(courseId) });
      if (course) query.courseId = course._id;
    }

    const progressDoc = await LessonProgress.findOne(query);

    return res.json({
      success: true,
      data: {
        lessonId: id,
        playbackPositionSeconds: progressDoc?.playbackPositionSeconds || 0,
        progress: progressDoc?.progress || 0,
        completed: Boolean(progressDoc?.completed),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
