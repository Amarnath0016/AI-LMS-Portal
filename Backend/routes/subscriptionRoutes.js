import express from "express";
import {
  getSubscriptionPlans,
  checkoutSubscription,
  getMySubscriptions,
  cancelSubscription,
  getAllSubscriptionsAdmin,
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "../controllers/subscriptionController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/plans", optionalAuth, getSubscriptionPlans);
router.post("/checkout", protect, checkoutSubscription);
router.get("/me", protect, getMySubscriptions);
router.post("/:id/cancel", protect, cancelSubscription);

// Admin inspection & plan management
router.get("/admin/all", protect, requireRole("admin"), getAllSubscriptionsAdmin);
router.post("/admin/plans", protect, requireRole("admin"), createSubscriptionPlan);
router.patch("/admin/plans/:id", protect, requireRole("admin"), updateSubscriptionPlan);

export default router;
