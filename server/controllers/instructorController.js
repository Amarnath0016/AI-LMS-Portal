import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import { LESSON_MATERIALS_DIR } from "../middleware/uploadMiddleware.js";

const getCourseQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

const checkCourseOwnership = (course, user) => {
  if (user.role === "admin") return true;
  const userIdStr = String(user._id || user.id);
  const instructorIdStr = String(course.instructorId || course.mentorId || "");
  return (
    instructorIdStr === userIdStr ||
    (user.id !== undefined && String(course.instructorId) === String(user.id)) ||
    (user._id !== undefined && String(course.instructorId) === String(user._id))
  );
};

/**
 * 1. Instructor Dashboard Metrics & Analytics
 */
export const getInstructorDashboard = async (req, res) => {
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

    const myCourses = await Course.find(filter).sort({ updatedAt: -1 });

    const totalCourses = myCourses.length;
    const approvedCourses = myCourses.filter((c) => c.status === "approved").length;
    const pendingCourses = myCourses.filter((c) => c.status === "pending").length;
    const draftCourses = myCourses.filter((c) => c.status === "draft").length;
    const rejectedCourses = myCourses.filter((c) => c.status === "rejected").length;

    // Real student enrollments and ratings from DB
    const validCourseOids = myCourses
      .map((c) => c._id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    let totalStudents = 0;
    let reviews = [];

    if (validCourseOids.length > 0) {
      totalStudents = await Enrollment.countDocuments({
        courseId: { $in: validCourseOids },
      });

      reviews = await Review.find({
        courseId: { $in: validCourseOids },
      });
    }

    const avgRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1))
        : 5.0;

    return res.json({
      success: true,
      data: {
        totalCourses,
        approvedCourses,
        pendingCourses,
        draftCourses,
        rejectedCourses,
        totalStudents,
        avgRating,
        totalReviews: reviews.length,
        courses: myCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get All Courses for Instructor
 */
export const getInstructorCourses = async (req, res) => {
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

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const courses = await Course.find(filter).sort({ updatedAt: -1 });
    return res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Get Course by ID for Course Builder
 */
export const getInstructorCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view or manage this course.",
      });
    }

    return res.json({ success: true, data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Create New Course (Initial state: "draft")
 */
export const createInstructorCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      tag,
      league,
      mentorId = 1,
      level = "Beginner",
      duration = "10h",
      price = 0,
      xp = 1000,
    } = req.body;

    if (!title || !description || !tag || !league) {
      return res.status(400).json({
        success: false,
        message: "Course title, description, tag, and league are required.",
      });
    }

    // Auto-generate next numeric id
    const highestIdCourse = await Course.findOne().sort({ id: -1 });
    const nextId = highestIdCourse && !isNaN(highestIdCourse.id) ? highestIdCourse.id + 1 : 101;

    const newCourse = await Course.create({
      id: nextId,
      title,
      description,
      tag,
      league,
      mentorId,
      level,
      duration,
      price: Number(price) || 0,
      xp: Number(xp) || 1000,
      instructorId: req.user._id || req.user.id,
      status: "draft",
      modules: [],
      lessons: [],
    });

    return res.status(201).json({
      success: true,
      message: "Course draft created successfully.",
      data: newCourse,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Update Course Details (Ownership check enforced)
 */
export const updateInstructorCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to modify this course.",
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "tag",
      "league",
      "mentorId",
      "level",
      "duration",
      "price",
      "xp",
      "status",
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        course[key] = req.body[key];
      }
    }

    await course.save();

    return res.json({
      success: true,
      message: "Course updated successfully.",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Delete Course (Ownership check enforced)
 */
export const deleteInstructorCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this course.",
      });
    }

    await Course.deleteOne(getCourseQuery(id));

    return res.json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Submit Course for Admin Review (Draft/Rejected -> Pending)
 */
export const submitCourseForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to submit this course.",
      });
    }

    if (!course.lessons || course.lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Course must have at least one lesson before submitting for review.",
      });
    }

    course.status = "pending";
    course.rejectionReason = "";
    await course.save();

    return res.json({
      success: true,
      message: "Course submitted for admin review successfully.",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. Module Management (Add, Update, Delete, Reorder)
 */
export const addCourseModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description = "" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Module title is required." });
    }

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const newModule = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      description: description.trim(),
      order: course.modules.length,
    };

    course.modules.push(newModule);
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Module added successfully.",
      data: newModule,
      course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourseModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const mod = course.modules.find((m) => String(m._id) === String(moduleId) || String(m.id) === String(moduleId));
    if (!mod) {
      return res.status(404).json({ success: false, message: "Module not found." });
    }

    if (req.body.title !== undefined) mod.title = req.body.title;
    if (req.body.description !== undefined) mod.description = req.body.description;
    if (req.body.order !== undefined) mod.order = req.body.order;

    await course.save();

    return res.json({ success: true, message: "Module updated.", data: mod, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourseModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    course.modules = course.modules.filter(
      (m) => String(m._id) !== String(moduleId) && String(m.id) !== String(moduleId)
    );

    // Unlink lessons that belonged to this module
    course.lessons.forEach((l) => {
      if (String(l.moduleId) === String(moduleId)) {
        l.moduleId = null;
        l.moduleTitle = "";
      }
    });

    await course.save();

    return res.json({ success: true, message: "Module deleted.", course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderCourseModules = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleIds } = req.body;

    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({ success: false, message: "moduleIds array is required." });
    }

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const idOrderMap = new Map();
    moduleIds.forEach((mId, index) => {
      idOrderMap.set(String(mId), index);
    });

    course.modules.forEach((mod) => {
      const targetOrder = idOrderMap.get(String(mod._id)) ?? idOrderMap.get(String(mod.id));
      if (targetOrder !== undefined) {
        mod.order = targetOrder;
      }
    });

    course.modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    await course.save();

    return res.json({ success: true, message: "Modules reordered.", data: course.modules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. Lesson Management (Add, Update, Delete, Reorder)
 */
export const addCourseLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      duration = "15 min",
      script = "",
      text = "",
      transcript = "",
      pdfNotes = "",
      videoUrl = "",
      moduleId = null,
      moduleTitle = "",
      quizQuestions = [],
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Lesson title is required." });
    }

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const newLesson = {
      _id: new mongoose.Types.ObjectId(),
      id: course.lessons.length + 1,
      title: title.trim(),
      duration,
      script,
      text,
      transcript,
      pdfNotes,
      videoUrl,
      moduleId,
      moduleTitle,
      order: course.lessons.length,
      attachments: [],
      quizQuestions: Array.isArray(quizQuestions) ? quizQuestions : [],
    };

    course.lessons.push(newLesson);
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Lesson added successfully.",
      data: newLesson,
      course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourseLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const lesson = course.lessons.find(
      (l) => String(l._id) === String(lessonId) || String(l.id) === String(lessonId)
    );
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    const allowedUpdates = [
      "title",
      "duration",
      "script",
      "text",
      "transcript",
      "pdfNotes",
      "videoUrl",
      "moduleId",
      "moduleTitle",
      "order",
      "quizQuestions",
    ];

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        lesson[key] = req.body[key];
      }
    }

    await course.save();

    return res.json({ success: true, message: "Lesson updated.", data: lesson, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourseLesson = async (req, res) => {
  try {
    const { id, lessonId } = req.params;
    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    course.lessons = course.lessons.filter(
      (l) => String(l._id) !== String(lessonId) && String(l.id) !== String(lessonId)
    );

    await course.save();

    return res.json({ success: true, message: "Lesson deleted.", course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderCourseLessons = async (req, res) => {
  try {
    const { id } = req.params;
    const { lessonIds } = req.body;

    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ success: false, message: "lessonIds array is required." });
    }

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const idOrderMap = new Map();
    lessonIds.forEach((lId, index) => {
      idOrderMap.set(String(lId), index);
    });

    course.lessons.forEach((l) => {
      const targetOrder = idOrderMap.get(String(l._id)) ?? idOrderMap.get(String(l.id));
      if (targetOrder !== undefined) {
        l.order = targetOrder;
      }
    });

    course.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    await course.save();

    return res.json({ success: true, message: "Lessons reordered.", data: course.lessons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. File Upload & Attachment Management (Stored outside web root)
 */
export const uploadLessonAttachment = async (req, res) => {
  try {
    const { id, lessonId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please provide a valid file to upload." });
    }

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      // Remove uploaded file if permission check fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const lesson = course.lessons.find(
      (l) => String(l._id) === String(lessonId) || String(l.id) === String(lessonId)
    );
    if (!lesson) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: "Lesson not found in course." });
    }

    const newAttachment = {
      _id: new mongoose.Types.ObjectId(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };

    if (!lesson.attachments) lesson.attachments = [];
    lesson.attachments.push(newAttachment);
    await course.save();

    return res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully.",
      data: newAttachment,
      lesson,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLessonAttachment = async (req, res) => {
  try {
    const { id, lessonId, attachmentId } = req.params;

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!checkCourseOwnership(course, req.user)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this course." });
    }

    const lesson = course.lessons.find(
      (l) => String(l._id) === String(lessonId) || String(l.id) === String(lessonId)
    );
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    const attachIndex = (lesson.attachments || []).findIndex(
      (a) => String(a._id) === String(attachmentId) || a.filename === attachmentId
    );

    if (attachIndex === -1) {
      return res.status(404).json({ success: false, message: "Attachment not found." });
    }

    const [removedAttachment] = lesson.attachments.splice(attachIndex, 1);
    await course.save();

    // Clean up file on disk if exists
    if (removedAttachment?.path && fs.existsSync(removedAttachment.path)) {
      try {
        fs.unlinkSync(removedAttachment.path);
      } catch (err) {
        console.warn("[File Cleanup] Failed to delete disk file:", err.message);
      }
    }

    return res.json({ success: true, message: "Attachment deleted.", lesson });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadLessonAttachment = async (req, res) => {
  try {
    const { id, lessonId, filename } = req.params;

    const course = await Course.findOne(getCourseQuery(id));
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Permission check: admin, course instructor, or enrolled student
    const isOwner = checkCourseOwnership(course, req.user);
    if (!isOwner) {
      const userOid = req.user._id;
      const courseOid = course._id;

      let isEnrolled = false;
      if (mongoose.Types.ObjectId.isValid(userOid) && mongoose.Types.ObjectId.isValid(courseOid)) {
        isEnrolled = await Enrollment.findOne({
          userId: userOid,
          courseId: courseOid,
        });
      }

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to download lesson materials.",
        });
      }
    }

    const lesson = course.lessons.find(
      (l) => String(l._id) === String(lessonId) || String(l.id) === String(lessonId)
    );
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }

    const attachment = (lesson.attachments || []).find((a) => a.filename === filename);
    const filePath = attachment?.path || path.join(LESSON_MATERIALS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on storage." });
    }

    return res.download(filePath, attachment?.originalName || filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
