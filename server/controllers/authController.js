import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/User.js";
import InstructorApplication from "../models/InstructorApplication.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { sendResetOtpEmail } from "../services/emailService.js";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
  adminCode: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  otp: z.string().length(6, "OTP must be a 6-digit code."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

export const register = async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || "Validation failed";
      return res.status(400).json({
        success: false,
        message: firstError,
        errors: parseResult.error.flatten?.()?.fieldErrors || {},
      });
    }

    const { name, email, password } = parseResult.data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Rule: client-supplied role is strictly ignored; always "student"
    const assignedRole = "student";

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      avatar: initials || "ST",
      xp: 0,
      streak: 1,
      skills: [],
      preferences: {
        pace: "Moderate",
        delivery: "Visual",
        dailyGoal: 2,
        timezone: "IST (UTC+5:30)",
      },
      enrolledCourses: [],
      status: "Active",
    });

    const userIdStr = newUser._id.toString();
    const accessToken = generateAccessToken({
      id: userIdStr,
      email: newUser.email,
      role: newUser.role,
    });
    const refreshToken = generateRefreshToken({
      id: userIdStr,
      email: newUser.email,
      role: newUser.role,
    });

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    const safeUser = newUser.toObject();
    delete safeUser.password;
    delete safeUser.resetOtpHash;

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      token: accessToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const { email, password, adminCode } = parseResult.data;

    const user = await User.findOne({ email: email.toLowerCase() });

    // No auto-create: reject unknown accounts with generic error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Strict password verification: no hardcoded passwords
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status && user.status !== "Active") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Account is inactive or suspended.",
      });
    }

    // Admin access code: server-verified second factor
    if (user.role === "admin") {
      const serverAdminCode = process.env.ADMIN_ACCESS_CODE || "123456";
      if (!adminCode || adminCode !== serverAdminCode) {
        return res.status(401).json({
          success: false,
          message: "Admin verification required: Invalid admin access code.",
        });
      }
    }

    const userIdStr = user._id.toString();
    const accessToken = generateAccessToken({
      id: userIdStr,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: userIdStr,
      email: user.email,
      role: user.role,
    });

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.resetOtpHash;

    return res.json({
      success: true,
      message: "Signed in successfully.",
      token: accessToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Refresh token missing.",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired refresh token.",
      });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(decoded.id)) {
      user = await User.findById(decoded.id);
    }
    if (!user && !isNaN(decoded.id)) {
      user = await User.findOne({ id: Number(decoded.id) });
    }

    if (!user || (user.status && user.status !== "Active")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User account is inactive or not found.",
      });
    }

    const userIdStr = user._id.toString();
    const newAccessToken = generateAccessToken({
      id: userIdStr,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({
      id: userIdStr,
      email: user.email,
      role: user.role,
    });

    res.cookie("refreshToken", newRefreshToken, getCookieOptions());

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.resetOtpHash;

    return res.json({
      success: true,
      token: newAccessToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Refresh failed.",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken", getCookieOptions());
  return res.json({ success: true, message: "Logged out successfully." });
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
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
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.resetOtpHash;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Whitelist fields: name, bio, phone, location, education, skills, preferences
    // Never allow: role, xp, password, status
    const ALLOWED_FIELDS = [
      "name",
      "bio",
      "phone",
      "location",
      "education",
      "skills",
      "preferences",
    ];

    const updates = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const userId = req.user._id || req.user.id;
    let query = {};
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query = { _id: userId };
    } else {
      query = { id: Number(userId) };
    }

    const updated = await User.findOneAndUpdate(query, { $set: updates }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const safeUser = updated.toObject();
    delete safeUser.password;
    delete safeUser.resetOtpHash;

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const { email } = parseResult.data;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Protect against account enumeration: return consistent response
    if (!user) {
      return res.json({
        success: true,
        message: "If that email is registered, a password reset code has been sent.",
      });
    }

    // Cryptographic 6-digit OTP
    const plainOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = await bcrypt.hash(plainOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    await User.findByIdAndUpdate(user._id, {
      $set: {
        resetOtpHash: hashedOtp,
        resetOtpExpiresAt: expiresAt,
        resetOtpUsed: false,
      },
    });

    await sendResetOtpEmail({
      to: user.email,
      name: user.name,
      otp: plainOtp,
    });

    return res.json({
      success: true,
      message: "If that email is registered, a password reset code has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide both account email and 6-digit verification code.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code.",
      });
    }

    if (user.resetOtpUsed) {
      return res.status(400).json({
        success: false,
        message: "This verification code has already been used.",
      });
    }

    if (new Date() > new Date(user.resetOtpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp.trim(), user.resetOtpHash);
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    // Single-use: mark as used
    await User.findByIdAndUpdate(user._id, { $set: { resetOtpUsed: true } });

    return res.json({
      success: true,
      message: "OTP verified successfully. You may now reset your password.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues?.[0]?.message || "Validation failed";
      return res.status(400).json({ success: false, message: msg });
    }

    const { email, otp, newPassword } = parseResult.data;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No active password reset request found.",
      });
    }

    if (new Date() > new Date(user.resetOtpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: "Reset code has expired. Please request a new one.",
      });
    }

    const isMatch = await bcrypt.compare(otp.trim(), user.resetOtpHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        resetOtpHash: null,
        resetOtpExpiresAt: null,
        resetOtpUsed: true,
      },
    });

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyInstructor = async (req, res) => {
  try {
    if (req.user.role === "instructor" || req.user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "You already have instructor or administrator privileges.",
      });
    }

    const userId = req.user._id || req.user.id;
    const existing = await InstructorApplication.findOne({
      userId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending instructor application under review.",
      });
    }

    const { subjects, experience, bio, linkedin } = req.body;
    const application = await InstructorApplication.create({
      userId,
      name: req.user.name,
      email: req.user.email,
      subjects: subjects || "General",
      experience: experience || "",
      bio: bio || "",
      linkedin: linkedin || "",
      status: "pending",
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Instructor application submitted successfully for admin review.",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
