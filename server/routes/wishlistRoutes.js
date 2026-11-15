import express from "express";
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyWishlist);
router.post("/:courseId", addToWishlist);
router.delete("/:courseId", removeFromWishlist);

export default router;
