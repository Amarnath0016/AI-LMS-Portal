import mongoose from "mongoose";
import Course from "../models/Course.js";
import Mentor from "../models/Mentor.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import LessonProgress from "../models/LessonProgress.js";

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

    return res.json({ success: true, count: courses.length, data: courses });
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

    const userId = req.user?._id || req.user?.id;
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user && !isNaN(userId)) {
      user = await User.findOne({ id: Number(userId) });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Save enrollment with ObjectId references and compound unique index
    try {
      await Enrollment.findOneAndUpdate(
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
    } catch (e) {
      // Ignore duplicate key error on upsert
    }

    // Keep user.enrolledCourses backwards compatible with numeric IDs / ObjectIds
    const identifier = course.id !== undefined ? course.id : course._id;
    if (!user.enrolledCourses.some((c) => String(c) === String(identifier) || String(c) === String(course._id))) {
      user.enrolledCourses.push(identifier);
      await user.save();
    }

    return res.json({
      success: true,
      message: `Enrolled in course #${course.id || course._id} successfully!`,
      courseId: course.id || course._id,
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
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    if (!user && !isNaN(userId)) {
      user = await User.findOne({ id: Number(userId) });
    }

    if (user) {
      const earnedXp = progress === 100 ? xpAward * 2 : xpAward;
      user.xp = (user.xp || 0) + earnedXp;
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
