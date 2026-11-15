import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  applyInstructor,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/apply-instructor", protect, applyInstructor);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);

export default router;
