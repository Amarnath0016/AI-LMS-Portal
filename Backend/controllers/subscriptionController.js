import mongoose from "mongoose";
import { z } from "zod";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Subscription from "../models/Subscription.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Notification from "../models/Notification.js";
import { getPaymentProvider } from "../services/paymentProviders/index.js";
import { markExpiredSubscriptions } from "../utils/subscriptionUtils.js";

// Zod Schema for Checkout validation
export const checkoutSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  courseId: z.union([z.string(), z.number()]).optional(),
  billingName: z.string().min(2, "Billing name must be at least 2 characters"),
  billingEmail: z.string().email("Please provide a valid email address"),
  cardNumber: z.string().min(12, "Card number is required"),
  expiry: z.string().min(4, "Expiry date is required"),
  cvv: z.string().min(3, "CVV is required"),
});

const getCourseQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

/**
 * GET /api/subscriptions/plans
 * Returns all active subscription plans
 */
export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    return res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/subscriptions/checkout
 * Processes demo or razorpay subscription checkout.
 * Enforces card field dropping, idempotency, auto-enrollment and notifications.
 */
export const checkoutSubscription = async (req, res) => {
  try {
    const parseResult = checkoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed: " + parseResult.error.issues.map((i) => i.message).join(", "),
        errors: parseResult.error.issues,
      });
    }

    // CRITICAL: Extract billing details and explicitly drop card credentials.
    // cardNumber, expiry and cvv are NEVER stored in the database or logged.
    const { planId, courseId, billingName, billingEmail } = parseResult.data;
    const userId = req.user._id || req.user.id;

    // 1. Fetch Plan
    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await SubscriptionPlan.findById(planId);
    }
    if (!plan) {
      plan = await SubscriptionPlan.findOne({ name: new RegExp(`^${planId}$`, "i") });
    }

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: "Subscription plan not found or inactive." });
    }

    // 2. Fetch specific course if provided
    let course = null;
    if (courseId) {
      course = await Course.findOne(getCourseQuery(courseId));
      if (!course) {
        return res.status(404).json({ success: false, message: "Selected course not found." });
      }
    }

    // 3. Lazy update expired subscriptions
    await markExpiredSubscriptions();

    // 4. Idempotency Check:
    // If user already has an active, unexpired subscription for this plan & course
    const now = new Date();
    const query = {
      userId,
      planId: plan._id,
      status: "active",
      expiresAt: { $gt: now },
    };
    if (course) {
      query.$or = [
        { courseIds: course._id },
        { courseIds: course.id },
        { courseIds: { $size: 0 } }, // covers all
      ];
    }

    const existingSub = await Subscription.findOne(query);
    if (existingSub) {
      return res.status(200).json({
        success: true,
        message: "You already have an active subscription for this plan.",
        data: existingSub,
        isExisting: true,
      });
    }

    // 5. Process Payment via Provider
    const provider = getPaymentProvider();
    const paymentResult = await provider.processPayment({
      plan,
      course,
      billingName,
      billingEmail,
    });

    if (!paymentResult.success) {
      return res.status(402).json({
        success: false,
        message: paymentResult.message || "Payment processing failed.",
      });
    }

    // 6. Calculate validity period
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Determine target courseIds
    let targetCourseIds = [];
    if (course) {
      targetCourseIds = [course._id];
      if (course.id !== undefined && course.id !== null) {
        targetCourseIds.push(course.id);
      }
    } else if (Array.isArray(plan.courseIds) && plan.courseIds.length > 0) {
      targetCourseIds = plan.courseIds;
    }

    // 7. Create Subscription record (ONLY name + email stored; NO card data!)
    const subscription = await Subscription.create({
      userId,
      planId: plan._id,
      courseIds: targetCourseIds,
      status: "active",
      startedAt,
      expiresAt,
      paymentMode: paymentResult.paymentMode || "demo",
      demoReference: paymentResult.demoReference,
      billingName,
      billingEmail,
    });

    // 8. Auto-enroll user in covered courses
    const isAllAccessPlan =
      !plan.name.toLowerCase().includes("single") &&
      (!Array.isArray(plan.courseIds) || plan.courseIds.length === 0);

    const coursesToEnroll = [];
    if (course) {
      coursesToEnroll.push(course);
    } else if (targetCourseIds.length > 0) {
      const foundCourses = await Course.find({
        $or: [{ _id: { $in: targetCourseIds } }, { id: { $in: targetCourseIds } }],
      });
      coursesToEnroll.push(...foundCourses);
    } else if (isAllAccessPlan) {
      // ONLY true all-access passes (Pro Monthly, Pro Yearly) auto-enroll all paid courses
      const allPaidCourses = await Course.find({
        $or: [{ accessType: "paid" }, { price: { $gt: 0 } }],
        status: "approved",
      });
      coursesToEnroll.push(...allPaidCourses);
    }

    for (const c of coursesToEnroll) {
      await Enrollment.findOneAndUpdate(
        { userId, courseId: c._id },
        {
          $setOnInsert: {
            userId,
            courseId: c._id,
            enrolledAt: new Date(),
            progress: 0,
            completedLessons: [],
          },
          $set: {
            isPaid: true,
            paymentConfirmed: true,
            status: "active",
          },
        },
        { upsert: true, new: true }
      );
    }

    // 9. Send in-app Notification
    await Notification.create({
      userId,
      title: "Subscription Activated 🚀",
      message: `Your ${plan.name} has been activated. You now have full access to learning materials through ${expiresAt.toLocaleDateString()}!`,
      type: "success",
      link: course ? `/courses/${course.id || course._id}` : "/courses",
    });

    return res.status(201).json({
      success: true,
      message: "Subscription activated successfully!",
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/subscriptions/me
 * Returns user's active subscription, subscription history, and subscribed courses.
 */
export const getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await markExpiredSubscriptions();

    const subscriptions = await Subscription.find({ userId })
      .populate("planId")
      .sort({ createdAt: -1 });

    const now = new Date();
    const activeSub = subscriptions.find(
      (s) => s.status === "active" && new Date(s.expiresAt) > now
    );

    // Find all courses accessible through active subscriptions
    let subscribedCourseIds = [];
    if (activeSub) {
      if (activeSub.planId && (!activeSub.planId.courseIds || activeSub.planId.courseIds.length === 0)) {
        // Plan covers all paid courses
        const allPaid = await Course.find({
          $or: [{ accessType: "paid" }, { price: { $gt: 0 } }],
        });
        subscribedCourseIds = allPaid.map((c) => String(c.id || c._id));
      } else {
        subscribedCourseIds = (activeSub.courseIds || []).map((id) => String(id));
      }
    }

    return res.json({
      success: true,
      data: subscriptions,
      activeSubscription: activeSub || null,
      subscribedCourseIds,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/subscriptions/:id/cancel
 * Cancels user's subscription
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const subscription = await Subscription.findOne({ _id: id, userId });
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    if (subscription.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Subscription is already cancelled." });
    }

    subscription.status = "cancelled";
    await subscription.save();

    await Notification.create({
      userId,
      title: "Subscription Cancelled",
      message: "Your subscription has been cancelled. You will continue to have access until your billing period concludes.",
      type: "info",
    });

    return res.json({
      success: true,
      message: "Subscription cancelled successfully.",
      data: subscription,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: GET /api/subscriptions/admin/all
 */
export const getAllSubscriptionsAdmin = async (req, res) => {
  try {
    await markExpiredSubscriptions();
    const subscriptions = await Subscription.find()
      .populate("userId", "name email")
      .populate("planId", "name price durationDays")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: POST /api/subscriptions/admin/plans
 */
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, price, durationDays, courseIds = [], description, features = [], isActive = true } = req.body;
    if (!name || price === undefined || !durationDays) {
      return res.status(400).json({ success: false, message: "name, price, and durationDays are required." });
    }

    const plan = await SubscriptionPlan.create({
      name,
      price: Number(price),
      durationDays: Number(durationDays),
      courseIds,
      description,
      features,
      isActive,
    });

    return res.status(201).json({ success: true, message: "Subscription plan created.", data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: PATCH /api/subscriptions/admin/plans/:id
 */
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    Object.assign(plan, req.body);
    await plan.save();

    return res.json({ success: true, message: "Subscription plan updated.", data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
