import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Course from "../models/Course.js";
import Mentor from "../models/Mentor.js";
import User from "../models/User.js";

const getCourseQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const wishlistItems = await Wishlist.find({
      $or: [{ userId }, { userId: req.user._id }, { userId: req.user.id }].filter(Boolean),
    }).sort({ addedAt: -1 });

    const allCourses = await Course.find();
    const allMentors = await Mentor.find();

    const courseMap = new Map();
    for (const c of allCourses) {
      courseMap.set(String(c._id), c);
      if (c.id !== undefined && c.id !== null) courseMap.set(String(c.id), c);
    }

    const mentorMap = new Map();
    for (const m of allMentors) {
      mentorMap.set(String(m._id), m);
      if (m.id !== undefined && m.id !== null) mentorMap.set(String(m.id), m);
    }

    const seenCourseIds = new Set();
    const coursesList = [];

    const addCourseToList = (course) => {
      const key = String(course._id);
      if (!seenCourseIds.has(key)) {
        seenCourseIds.add(key);
        if (course.id !== undefined && course.id !== null) {
          seenCourseIds.add(String(course.id));
        }
        const cObj = course.toObject ? course.toObject() : { ...course };
        cObj.mentor = mentorMap.get(String(course.mentorId)) || course.mentor || null;
        coursesList.push(cObj);
      }
    };

    for (const item of wishlistItems) {
      const course = courseMap.get(String(item.courseId));
      if (course) {
        addCourseToList(course);
      }
    }

    // Also check User.wishlist array in case any courses are tracked there
    const userDoc = await User.findById(userId);
    if (userDoc && Array.isArray(userDoc.wishlist)) {
      for (const rawId of userDoc.wishlist) {
        const course = courseMap.get(String(rawId));
        if (course) {
          addCourseToList(course);
        }
      }
    }

    return res.json({
      success: true,
      count: coursesList.length,
      data: coursesList,
      rawItems: wishlistItems,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id || req.user.id;

    const course = await Course.findOne(getCourseQuery(courseId));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const item = await Wishlist.findOneAndUpdate(
      { userId, courseId: course._id },
      { $setOnInsert: { userId, courseId: course._id, addedAt: new Date() } },
      { upsert: true, new: true }
    );

    // Keep user.wishlist in sync
    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: course.id !== undefined ? course.id : course._id },
    });

    return res.status(200).json({
      success: true,
      message: `Course "${course.title}" added to wishlist.`,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id || req.user.id;

    const course = await Course.findOne(getCourseQuery(courseId));
    const targetId = course ? course._id : courseId;

    const pullIds = [
      targetId,
      course?._id,
      course?.id,
      courseId,
      !isNaN(courseId) ? Number(courseId) : null,
      String(targetId),
    ].filter((v) => v !== null && v !== undefined);

    // Ownership check: deletes only from requesting user's wishlist
    await Wishlist.deleteMany({
      userId,
      $or: [
        { courseId: targetId },
        { courseId: course?._id },
        { courseId: course?.id },
        { courseId: courseId },
        { courseId: !isNaN(courseId) ? Number(courseId) : -1 },
        { courseId: String(targetId) },
      ].filter(Boolean),
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: { $in: pullIds } },
    });

    return res.json({
      success: true,
      message: "Course removed from wishlist.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
