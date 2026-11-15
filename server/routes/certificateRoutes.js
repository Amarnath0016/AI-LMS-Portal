import express from "express";
import {
  getUserCertificates,
  verifyCertificate,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserCertificates);
router.get("/verify/:code", verifyCertificate);

export default router;
