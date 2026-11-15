import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../config/db.js";
import {
  User,
  Mentor,
  Course,
  Lesson,
  Enrollment,
  LessonProgress,
  Quiz,
  QuizAttempt,
  Certificate,
  ForumPost,
  Review,
  Notification,
  Wishlist,
} from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";
import { app } from "../server.js";

describe("LMS Core & API Source of Truth Integration Tests", () => {
  let mongoServer;
  let testMongoUri;
  let studentUser;
  let studentToken;
  let student2User;
  let student2Token;
  let adminUser;
  let adminToken;
  let freeCourse;
  let paidCourse;
  let courseLesson1;
  let courseLesson2;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    testMongoUri = mongoServer.getUri();
    process.env.MONGO_URI = testMongoUri;
    await connectDB(testMongoUri);

    await Promise.all([
      User.init(),
      Enrollment.init(),
      Certificate.init(),
      Quiz.init(),
      Review.init(),
      Wishlist.init(),
      Notification.init(),
    ]);

    // Create student 1
    studentUser = await User.create({
      id: 1,
      name: "Alice Student",
      email: "alice@uptoskills.com",
      password: await bcrypt.hash("password123", 10),
      role: "student",
      status: "Active",
      xp: 100,
      streak: 2,
    });
    studentToken = generateAccessToken({
      _id: studentUser._id.toString(),
      id: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    // Create student 2 (for ownership check verification)
    student2User = await User.create({
      id: 2,
      name: "Bob Student",
      email: "bob@uptoskills.com",
      password: await bcrypt.hash("password123", 10),
      role: "student",
      status: "Active",
      xp: 50,
      streak: 1,
    });
    student2Token = generateAccessToken({
      _id: student2User._id.toString(),
      id: student2User._id.toString(),
      email: student2User.email,
      role: student2User.role,
    });

    // Create admin user
    adminUser = await User.create({
      id: 99,
      name: "Admin Super",
      email: "admin_tester@uptoskills.com",
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

    // Create test free course with 2 lessons
    courseLesson1 = {
      id: 101,
      title: "Introduction to Core Concepts",
      duration: "10 mins",
      order: 1,
    };
    courseLesson2 = {
      id: 102,
      title: "Advanced Implementation",
      duration: "20 mins",
      order: 2,
    };

    freeCourse = await Course.create({
      id: 501,
      title: "Free Python Essentials",
      tag: "Programming",
      league: "Python League",
      level: "Beginner",
      price: 0,
      status: "approved",
      mentorId: 1,
      description: "Learn Python from scratch with interactive lessons and quizzes.",
      lessons: [courseLesson1, courseLesson2],
    });

    paidCourse = await Course.create({
      id: 502,
      title: "Paid Cloud Architecture",
      tag: "Cloud",
      league: "Cloud League",
      level: "Advanced",
      price: 2999,
      status: "approved",
      mentorId: 2,
      description: "Master modern multi-cloud distributed system engineering.",
      lessons: [courseLesson1],
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) await mongoServer.stop();
  });

  describe("1. Course Enrollment Flow", () => {
    it("POST /api/courses/:id/enroll should successfully enroll in a free approved course", async () => {
      const res = await request(app)
        .post(`/api/courses/${freeCourse._id}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.enrollment);
      assert.equal(res.body.enrollment.progress, 0);

      // Verify Enrollment record in DB
      const dbEnrollment = await Enrollment.findOne({
        userId: studentUser._id,
        courseId: freeCourse._id,
      });
      assert.ok(dbEnrollment);
    });

    it("POST /api/courses/:id/enroll should reject paid course without paymentDetails", async () => {
      const res = await request(app)
        .post(`/api/courses/${paidCourse._id}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 402);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /payment/i);
    });

    it("POST /api/courses/:id/enroll should accept paid course with paymentDetails", async () => {
      const res = await request(app)
        .post(`/api/courses/${paidCourse._id}/enroll`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ paymentDetails: { transactionId: "TXN_TEST_123", amount: 2999 } });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    it("GET /api/me/enrollments should return current user enrollments with course details", async () => {
      const res = await request(app)
        .get("/api/me/enrollments")
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.equal(res.body.data.length, 2);
      assert.ok(res.body.data.some((e) => e.course?.title === "Free Python Essentials"));
    });
  });

  describe("2. Lesson Completion, Progress Math & Idempotency", () => {
    it("POST /api/lessons/:id/complete should complete lesson 1 and compute 50% progress", async () => {
      const res = await request(app)
        .post(`/api/lessons/${courseLesson1.id}/complete`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ courseId: freeCourse._id });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.progress, 50); // 1 of 2 lessons = 50%
      assert.ok(res.body.xpAwarded > 0);

      // Verify User XP and streak updated
      const updatedUser = await User.findById(studentUser._id);
      assert.ok(updatedUser.xp > 100);
    });

    it("POST /api/lessons/:id/complete should be idempotent on repeated calls", async () => {
      const res = await request(app)
        .post(`/api/lessons/${courseLesson1.id}/complete`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ courseId: freeCourse._id });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.progress, 50);
      assert.equal(res.body.earnedXp, 0); // No double XP awarded
      assert.match(res.body.message, /already completed/i);
    });
  });

  describe("3. Quiz Sanitization & Server-side Grading", () => {
    before(async () => {
      // Create quiz with answers stored in DB
      await Quiz.create({
        id: 77,
        leagueId: 501,
        partId: 1,
        title: "Python Essentials Mastery Quiz",
        questions: [
          {
            id: 1,
            question: "What keyword defines a function in Python?",
            options: ["func", "def", "function", "lambda"],
            answer: 1, // 'def' is index 1
            explanation: "The def keyword is used to create a function in Python.",
          },
          {
            id: 2,
            question: "Which collection is ordered and immutable?",
            options: ["Set", "List", "Dictionary", "Tuple"],
            answer: 3, // 'Tuple' is index 3
            explanation: "Tuples are immutable sequences.",
          },
        ],
      });
    });

    it("GET /api/quizzes/:leagueId/:partId must NOT return answer or explanation", async () => {
      const res = await request(app).get("/api/quizzes/501/1");

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const questions = res.body.data.questions;
      assert.ok(questions.length > 0);

      questions.forEach((q) => {
        assert.equal(q.answer, undefined, "Sanitized question must NOT contain answer");
        assert.equal(q.explanation, undefined, "Sanitized question must NOT contain explanation");
      });
    });

    it("POST /api/quizzes/:id/submit should accurately grade answers on server and return score", async () => {
      const res = await request(app)
        .post("/api/quizzes/501-1/submit")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          leagueId: 501,
          partId: 1,
          answers: { 1: 1, 2: 3 }, // Both correct
          xpAward: 200,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.score, 2);
      assert.equal(res.body.maxQuestions, 2);
      assert.equal(res.body.passed, true);
      assert.equal(res.body.earnedXp, 200);

      // Verify QuizAttempt stored
      const attempt = await QuizAttempt.findOne({ userId: studentUser._id, leagueId: 501 });
      assert.ok(attempt);
      assert.equal(attempt.passed, true);
    });
  });

  describe("4. Certificate Server-side Issuance & Verification", () => {
    it("Should issue certificate only when lesson progress is 100% and required quizzes passed", async () => {
      // Complete lesson 2 to reach 100% progress
      const res = await request(app)
        .post(`/api/lessons/${courseLesson2.id}/complete`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ courseId: freeCourse._id });

      assert.equal(res.status, 200);
      assert.equal(res.body.progress, 100);

      // Certificate should now be issued by server
      const cert = await Certificate.findOne({
        userId: studentUser._id,
        courseId: freeCourse._id,
      });
      assert.ok(cert, "Certificate should be generated in DB");
      assert.ok(cert.verificationCode, "Must have unique verification code");
      assert.match(cert.verificationCode, /^UPTO-/);

      // Notification should also be delivered
      const notif = await Notification.findOne({
        userId: studentUser._id,
        type: "achievement",
      });
      assert.ok(notif, "Notification about certificate should exist");
    });

    it("GET /api/certificates returns ONLY the authenticated user's certificates", async () => {
      // Alice checks her certificates
      const resAlice = await request(app)
        .get("/api/certificates")
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(resAlice.status, 200);
      assert.ok(resAlice.body.data.length >= 1);

      // Bob checks his certificates (should be empty, isolation)
      const resBob = await request(app)
        .get("/api/certificates")
        .set("Authorization", `Bearer ${student2Token}`);

      assert.equal(resBob.status, 200);
      assert.equal(resBob.body.data.length, 0);
    });

    it("GET /api/certificates/verify/:code should be public and verify authentic credential", async () => {
      const cert = await Certificate.findOne({ userId: studentUser._id });
      assert.ok(cert);

      const res = await request(app).get(`/api/certificates/verify/${cert.verificationCode}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.valid, true);
      assert.equal(res.body.data.userName, studentUser.name);
    });
  });

  describe("5. Ownership Checks (Wishlist, Reviews, Notifications, Forum)", () => {
    it("Wishlist: user can add and only manage their own wishlist", async () => {
      // Add to Alice's wishlist
      const addRes = await request(app)
        .post(`/api/wishlist/${freeCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`);
      assert.equal(addRes.status, 200);

      // Alice's wishlist contains course
      const aliceList = await request(app)
        .get("/api/wishlist")
        .set("Authorization", `Bearer ${studentToken}`);
      assert.equal(aliceList.body.data.length, 1);

      // Bob's wishlist does not contain it
      const bobList = await request(app)
        .get("/api/wishlist")
        .set("Authorization", `Bearer ${student2Token}`);
      assert.equal(bobList.body.data.length, 0);
    });

    it("Reviews: user can review and only author or admin can delete", async () => {
      // Alice creates review
      const revRes = await request(app)
        .post(`/api/reviews/${freeCourse._id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ rating: 5, comment: "Excellent course structure!" });
      assert.equal(revRes.status, 201);
      const reviewId = revRes.body.data._id;

      // Bob tries to delete Alice's review -> 403 Forbidden
      const bobDeleteRes = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${student2Token}`);
      assert.equal(bobDeleteRes.status, 403);

      // Alice deletes her own review -> 200 OK
      const aliceDeleteRes = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${studentToken}`);
      assert.equal(aliceDeleteRes.status, 200);
    });

    it("Forum: only author or admin can delete discussion posts", async () => {
      // Alice posts in forum
      const postRes = await request(app)
        .post("/api/forum")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          title: "Question on Recursion",
          content: "Can someone clarify base cases?",
          category: "Programming",
        });
      assert.equal(postRes.status, 201);
      const postId = postRes.body.data._id;

      // Bob tries to delete Alice's post -> 403 Forbidden
      const bobDelete = await request(app)
        .delete(`/api/forum/${postId}`)
        .set("Authorization", `Bearer ${student2Token}`);
      assert.equal(bobDelete.status, 403);

      // Admin can delete it -> 200 OK
      const adminDelete = await request(app)
        .delete(`/api/forum/${postId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      assert.equal(adminDelete.status, 200);
    });
  });

  describe("6. Server-side Leaderboard & Activity Streaks", () => {
    it("GET /api/leaderboard should return ranked learners with server-computed XP & streak", async () => {
      const res = await request(app).get("/api/leaderboard");

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 2);

      // Verify sorted by XP descending
      for (let i = 0; i < res.body.data.length - 1; i++) {
        assert.ok(res.body.data[i].xp >= res.body.data[i + 1].xp);
        assert.equal(res.body.data[i].rank, i + 1);
        assert.ok(res.body.data[i].streak >= 1);
      }
    });
  });
});
