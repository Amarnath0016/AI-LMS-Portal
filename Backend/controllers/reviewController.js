import mongoose from "mongoose";
import Review from "../models/Review.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

const getCourseQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getReviews = async (req, res) => {
  try {
    const { courseId } = req.query;
    let filter = {};

    if (courseId) {
      const course = await Course.findOne(getCourseQuery(courseId));
      if (course) {
        filter = { courseId: course._id };
      } else {
        filter = { courseId };
      }
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    const allUsers = await User.find().select("name avatar");
    const userMap = new Map();
    for (const u of allUsers) {
      userMap.set(String(u._id), u);
      if (u.id !== undefined) userMap.set(String(u.id), u);
    }

    const allCourses = await Course.find().select("title id");
    const courseMap = new Map();
    for (const c of allCourses) {
      courseMap.set(String(c._id), c);
      if (c.id !== undefined) courseMap.set(String(c.id), c);
    }

    const enriched = reviews.map((r) => {
      const user = userMap.get(String(r.userId));
      const course = courseMap.get(String(r.courseId));
      return {
        _id: r._id,
        id: r.id || r._id,
        courseId: course?.id || r.courseId,
        courseTitle: course?.title || "Course",
        userName: user?.name || "Verified Student",
        avatar: user?.avatar || "ST",
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        date: new Date(r.createdAt || Date.now()).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };
    });

    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { courseId: paramCourseId } = req.params;
    const { courseId: bodyCourseId, rating, comment } = req.body;
    const courseTarget = paramCourseId || bodyCourseId;

    if (!courseTarget) {
      return res.status(400).json({ success: false, message: "Course ID is required." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    const course = await Course.findOne(getCourseQuery(courseTarget));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const userId = req.user._id || req.user.id;

    // Create or update review with compound unique index
    const review = await Review.findOneAndUpdate(
      { courseId: course._id, userId },
      {
        $set: {
          courseId: course._id,
          userId,
          rating: Number(rating),
          comment: comment ? comment.trim() : "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully! Thank you for your feedback.",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    // Ownership check: must be owner of review or administrator
    const isOwner = String(review.userId) === String(req.user._id || req.user.id);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this review.",
      });
    }

    await Review.findByIdAndDelete(review._id);
    return res.json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
