import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Mentor from "../models/Mentor.js";
import InstructorApplication from "../models/InstructorApplication.js";

const getUserQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

const getCourseQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -resetOtpHash").sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const inviteUser = async (req, res) => {
  try {
    const { name, email, role = "student" } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash("temp1234", 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: "Active",
      xp: 0,
      streak: 1,
      avatar: name[0].toUpperCase(),
    });

    const safe = newUser.toObject();
    delete safe.password;
    delete safe.resetOtpHash;
    return res.status(201).json({ success: true, message: "Invitation sent.", data: safe });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (role) updateFields.role = role;

    const updated = await User.findOneAndUpdate(getUserQuery(id), { $set: updateFields }, { new: true }).select("-password -resetOtpHash");
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, message: "User updated successfully.", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findOneAndDelete(getUserQuery(id));
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, message: "User removed successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOneAndUpdate(getCourseQuery(id), { $set: { status: "approved" } }, { new: true });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    return res.json({ success: true, message: "Course approved.", data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOneAndUpdate(getCourseQuery(id), { $set: { status: "rejected" } }, { new: true });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    return res.json({ success: true, message: "Course rejected.", data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const approvedCourses = await Course.countDocuments({ status: "approved" });
    const totalMentors = await Mentor.countDocuments();

    return res.json({
      success: true,
      data: {
        totalUsers,
        activeStudents: Math.max(totalUsers - 2, 1),
        totalCourses,
        approvedCourses,
        totalMentors,
        systemHealth: "Optimal",
        aiInferenceAvgMs: 312,
        serverUptime: process.uptime(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Instructor Application Flow - Admin Review
export const getInstructorApplications = async (req, res) => {
  try {
    const applications = await InstructorApplication.find().sort({ submittedAt: -1 });
    return res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveInstructorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { id };
    }

    const application = await InstructorApplication.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: "Instructor application not found." });
    }

    application.status = "approved";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.email;
    await application.save();

    // Upgrade the user to role "instructor"
    const user = await User.findOneAndUpdate(
      getUserQuery(application.userId),
      { $set: { role: "instructor" } },
      { new: true }
    );

    return res.json({
      success: true,
      message: `Instructor application approved. User ${application.email} upgraded to instructor.`,
      application,
      user: user ? { id: user._id || user.id, email: user.email, role: user.role } : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectInstructorApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { id };
    }

    const application = await InstructorApplication.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, message: "Instructor application not found." });
    }

    application.status = "rejected";
    application.rejectionReason = reason || "Does not meet current requirements";
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.email;
    await application.save();

    return res.json({
      success: true,
      message: "Instructor application rejected.",
      application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
