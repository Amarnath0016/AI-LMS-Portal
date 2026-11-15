import mongoose from "mongoose";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required: No token provided.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token is malformed or expired.",
      });
    }

    let user = null;
    if (mongoose.Types.ObjectId.isValid(decoded.id)) {
      user = await User.findById(decoded.id);
    }
    if (!user && !isNaN(decoded.id)) {
      user = await User.findOne({ id: Number(decoded.id) });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User account not found.",
      });
    }

    if (user.status && user.status !== "Active") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Account is inactive or suspended.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Authentication verification failed.",
      error: error.message,
    });
  }
};
