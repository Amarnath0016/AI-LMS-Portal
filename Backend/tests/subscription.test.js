import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../config/db.js";
import {
  User,
  Course,
  SubscriptionPlan,
  Subscription,
  Enrollment,
  Notification,
} from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";
import { hasCourseAccess, verifyProductionPaymentGuard, markExpiredSubscriptions } from "../utils/subscriptionUtils.js";
import { app } from "../server.js";

describe("Subscription & Access Control Test Suite", () => {
  let mongoServer;
  let studentUser;
  let studentToken;
  let adminUser;
  let adminToken;
  let freeCourse;
  let paidCourse;
  let singlePlan;
  let proPlan;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const testMongoUri = mongoServer.getUri();
    process.env.MONGO_URI = testMongoUri;
    process.env.PAYMENT_MODE = "demo";
    await connectDB(testMongoUri);

    await Promise.all([
      User.init(),
      Course.init(),
      SubscriptionPlan.init(),
      Subscription.init(),
      Enrollment.init(),
      Notification.init(),
    ]);

    // Create student user
    studentUser = await User.create({
      id: 101,
      name: "Sub Student",
      email: "sub_student@uptoskills.com",
      password: await bcrypt.hash("password123", 10),
      role: "student",
      status: "Active",
      xp: 0,
      streak: 1,
    });
    studentToken = generateAccessToken({
      _id: studentUser._id.toString(),
      id: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    // Create admin user
    adminUser = await User.create({
      id: 999,
      name: "Super Admin",
      email: "super_admin@uptoskills.com",
      password: await bcrypt.hash("password123", 10),
      role: "admin",
      status: "Active",
    });
    adminToken = generateAccessToken({
      _id: adminUser._id.toString(),
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create Free Course
    freeCourse = await Course.create({
      id: 801,
      title: "Free Python 101",
      tag: "Programming",
      league: "Python League",
      level: "Beginner",
      accessType: "free",
      price: 0,
      status: "approved",
      mentorId: 1,
      description: "Learn Python for free.",
      lessons: [
        { id: 901, title: "Intro", script: "Secret intro script", text: "Free text", duration: "10 mins", order: 1 },
      ],
    });

    // Create Paid Course
    paidCourse = await Course.create({
      id: 802,
      title: "Paid Cloud DevOps Pro",
      tag: "Cloud",
      league: "DevOps League",
      level: "Advanced",
      accessType: "paid",
      price: 2999,
      status: "approved",
      mentorId: 2,
      description: "Master DevOps infrastructure.",
      lessons: [
        { id: 902, title: "Kubernetes Deep Dive", script: "Classified architecture script", text: "Premium text", duration: "30 mins", order: 1 },
      ],
    });

    // Create Subscription Plans
    singlePlan = await SubscriptionPlan.create({
      name: "Single Course Pass",
      price: 999,
      durationDays: 90,
      courseIds: [paidCourse._id],
      description: "Single course access for 90 days",
      features: ["Full course access", "Certificate"],
      isActive: true,
    });

    proPlan = await SubscriptionPlan.create({
      name: "Pro Monthly",
      price: 1499,
      durationDays: 30,
      courseIds: [], // Empty means ALL paid courses
      description: "All-access monthly pass",
      features: ["All courses", "AI Mentor"],
      isActive: true,
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) await mongoServer.stop();
  });

  describe("1. Course Access Control Logic", () => {
    it("free course is accessible to everyone without subscription", async () => {
      const access = await hasCourseAccess(studentUser, freeCourse);
      assert.equal(access, true);

      // GET /api/courses/:id returns unlocked course
      const res = await request(app)
        .get(`/api/courses/${freeCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isLocked, false);
      assert.equal(res.body.data.hasAccess, true);
      assert.equal(res.body.data.lessons[0].script, "Secret intro script");
    });

    it("paid course returns 402 with SUBSCRIPTION_REQUIRED when student has no subscription", async () => {
      const access = await hasCourseAccess(studentUser, paidCourse);
      assert.equal(access, false);

      // GET /api/courses/:id redacts premium lesson scripts
      const getRes = await request(app)
        .get(`/api/courses/${paidCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(getRes.status, 200);
      assert.equal(getRes.body.data.isLocked, true);
      assert.equal(getRes.body.data.hasAccess, false);
      assert.equal(getRes.body.data.lessons[0].script, undefined);

      // POST /api/courses/:id/enroll returns 402 SUBSCRIPTION_REQUIRED
      const enrollRes = await request(app)
        .post(`/api/courses/${paidCourse._id}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(enrollRes.status, 402);
      assert.equal(enrollRes.body.code, "SUBSCRIPTION_REQUIRED");
      assert.equal(enrollRes.body.courseId, 802);
    });

    it("admin always has access to paid courses", async () => {
      const access = await hasCourseAccess(adminUser, paidCourse);
      assert.equal(access, true);
    });
  });

  describe("2. Demo Checkout Flow & Access Granting", () => {
    let createdSubscriptionId;

    it("demo checkout with random data creates subscription and auto-enrolls user", async () => {
      const checkoutData = {
        planId: singlePlan._id.toString(),
        courseId: paidCourse._id.toString(),
        billingName: "Random Tester",
        billingEmail: "random.tester@example.com",
        cardNumber: "4111 2222 3333 4444",
        expiry: "12/28",
        cvv: "789",
      };

      const res = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(checkoutData);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data);
      assert.equal(res.body.data.status, "active");
      assert.equal(res.body.data.paymentMode, "demo");
      assert.ok(res.body.data.demoReference.startsWith("DEMO-"));
      createdSubscriptionId = res.body.data._id;

      // Verify user has course access now
      const access = await hasCourseAccess(studentUser, paidCourse);
      assert.equal(access, true);

      // Verify auto-enrollment was created
      const enrollment = await Enrollment.findOne({
        userId: studentUser._id,
        courseId: paidCourse._id,
      });
      assert.ok(enrollment);
      assert.equal(enrollment.isPaid, true);

      // Verify in-app notification was sent
      const notification = await Notification.findOne({
        userId: studentUser._id,
        title: /Subscription Activated/i,
      });
      assert.ok(notification);
    });

    it("unlocked course now reveals full lesson script and details", async () => {
      const getRes = await request(app)
        .get(`/api/courses/${paidCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(getRes.status, 200);
      assert.equal(getRes.body.data.isLocked, false);
      assert.equal(getRes.body.data.hasAccess, true);
      assert.equal(getRes.body.data.lessons[0].script, "Classified architecture script");
    });

    it("idempotent checkout: repeating checkout returns existing active subscription", async () => {
      const checkoutData = {
        planId: singlePlan._id.toString(),
        courseId: paidCourse._id.toString(),
        billingName: "Random Tester",
        billingEmail: "random.tester@example.com",
        cardNumber: "5555 4444 3333 2222",
        expiry: "11/29",
        cvv: "123",
      };

      const res = await request(app)
        .post("/api/subscriptions/checkout")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(checkoutData);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.isExisting, true);
      assert.equal(res.body.data._id, createdSubscriptionId);
    });

    it("GET /api/subscriptions/me returns user's active subscription", async () => {
      const res = await request(app)
        .get("/api/subscriptions/me")
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.some((s) => s._id === createdSubscriptionId));
    });
  });

  describe("3. Security: Card Details NEVER Stored or Persisted", () => {
    it("ensures card number, cvv, and expiry are not in Subscription document", async () => {
      const sub = await Subscription.findOne({ userId: studentUser._id }).lean();
      assert.ok(sub);
      assert.equal(sub.cardNumber, undefined);
      assert.equal(sub.cvv, undefined);
      assert.equal(sub.expiry, undefined);
      assert.equal(sub.card, undefined);

      // Verify only billingName and billingEmail are present
      assert.equal(sub.billingName, "Random Tester");
      assert.equal(sub.billingEmail, "random.tester@example.com");
    });
  });

  describe("4. Expiration Lifecycle Handling", () => {
    it("expired subscription loses access", async () => {
      // Manually backdate subscription expiry
      await Subscription.updateMany(
        { userId: studentUser._id },
        { $set: { expiresAt: new Date(Date.now() - 10000), status: "active" } }
      );
      // Remove enrollment isPaid so access relies strictly on subscription check
      await Enrollment.deleteMany({ userId: studentUser._id });

      // Trigger lazy expiration
      await markExpiredSubscriptions();

      const expiredSub = await Subscription.findOne({ userId: studentUser._id });
      assert.equal(expiredSub.status, "expired");

      const access = await hasCourseAccess(studentUser, paidCourse);
      assert.equal(access, false);
    });
  });

  describe("5. Production Payment Mode Security Guard", () => {
    it("refuses demo payment mode in production unless ALLOW_DEMO_PAYMENTS=true", () => {
      const prodEnvWithoutFlag = {
        NODE_ENV: "production",
        PAYMENT_MODE: "demo",
        ALLOW_DEMO_PAYMENTS: "false",
      };
      const check1 = verifyProductionPaymentGuard(prodEnvWithoutFlag);
      assert.equal(check1.allowed, false);
      assert.match(check1.message, /CRITICAL SECURITY/);

      const prodEnvWithFlag = {
        NODE_ENV: "production",
        PAYMENT_MODE: "demo",
        ALLOW_DEMO_PAYMENTS: "true",
      };
      const check2 = verifyProductionPaymentGuard(prodEnvWithFlag);
      assert.equal(check2.allowed, true);

      const devEnv = {
        NODE_ENV: "development",
        PAYMENT_MODE: "demo",
      };
      const check3 = verifyProductionPaymentGuard(devEnv);
      assert.equal(check3.allowed, true);

      const razorpayProd = {
        NODE_ENV: "production",
        PAYMENT_MODE: "razorpay",
      };
      const check4 = verifyProductionPaymentGuard(razorpayProd);
      assert.equal(check4.allowed, true);
    });
  });
});
