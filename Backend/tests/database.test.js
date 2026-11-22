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
  Module,
  Enrollment,
  LessonProgress,
  Quiz,
  QuizAttempt,
  Certificate,
  ForumPost,
  ForumComment,
  Review,
  Notification,
  ChallengeSubmission,
  DailyChallenge,
  InstructorApplication,
} from "../models/index.js";
import { seedDatabase } from "../scripts/seed.js";
import { generateAccessToken } from "../utils/jwt.js";
import { app } from "../server.js";

describe("MongoDB & Mongoose Architecture Tests", () => {
  let mongoServer;
  let testMongoUri;
  let testUserToken;
  let testUser;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    testMongoUri = mongoServer.getUri();
    process.env.MONGO_URI = testMongoUri;
    await connectDB(testMongoUri);

    // Wait for all model indexes to be built in Mongo
    await Promise.all([
      User.init(),
      Enrollment.init(),
      Certificate.init(),
      Quiz.init(),
      Review.init(),
    ]);

    testUser = await User.create({
      name: "Architecture Tester",
      email: "arch_tester@uptoskills.com",
      password: await bcrypt.hash("password123", 10),
      role: "student",
      status: "Active",
    });

    testUserToken = generateAccessToken({
      id: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role,
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe("1. Connection & Fail-Fast Behavior", () => {
    it("should fail fast with clear message when MONGO_URI is unreachable", async () => {
      const unreachableUri = "mongodb://127.0.0.1:19999/unreachable_db";
      await assert.rejects(
        async () => {
          await disconnectDB();
          await connectDB(unreachableUri);
        },
        (err) => {
          assert.match(err.message, /\[DB\] CRITICAL ERROR: Failed to connect to MongoDB/i);
          return true;
        }
      );

      // Reconnect back to test memory server
      await connectDB(testMongoUri);
      await Promise.all([User.init(), Enrollment.init()]);
    });

    it("should fail fast if MONGO_URI is missing", async () => {
      await assert.rejects(
        async () => {
          await disconnectDB();
          delete process.env.MONGO_URI;
          await connectDB();
        },
        (err) => {
          assert.match(err.message, /MONGO_URI is not defined/i);
          return true;
        }
      );

      // Restore
      process.env.MONGO_URI = testMongoUri;
      await connectDB(testMongoUri);
      await Promise.all([User.init(), Enrollment.init()]);
    });
  });

  describe("2. Schema Index Enforcements", () => {
    it("should enforce unique index on user email", async () => {
      const email = `unique_test_${Date.now()}@uptoskills.com`;
      await User.create({
        name: "First User",
        email,
        password: "securePassword123",
      });

      // Attempt duplicate user with same email
      await assert.rejects(
        async () => {
          await User.create({
            name: "Duplicate User",
            email,
            password: "anotherPassword123",
          });
        },
        (err) => {
          assert.equal(err.code, 11000, "Should throw Mongo duplicate key error (11000)");
          return true;
        }
      );
    });

    it("should enforce unique compound index on enrollment (userId + courseId)", async () => {
      const student = await User.create({
        name: "Enrollment Student",
        email: `enrollment_${Date.now()}@uptoskills.com`,
        password: "password123",
      });

      const course = await Course.create({
        id: 9999,
        title: "Database Indexing Mastery",
        tag: "Database",
        mentorId: 1,
        league: "Backend League",
        description: "Deep dive into MongoDB indexes.",
      });

      // First enrollment succeeds
      const first = await Enrollment.create({
        userId: student._id,
        courseId: course._id,
        progress: 10,
      });
      assert.ok(first._id);

      // Second enrollment for same user and course must fail due to compound index
      await assert.rejects(
        async () => {
          await Enrollment.create({
            userId: student._id,
            courseId: course._id,
            progress: 20,
          });
        },
        (err) => {
          assert.equal(err.code, 11000, "Duplicate enrollment must be rejected by unique index");
          return true;
        }
      );
    });
  });

  describe("3. Mongoose Model Architecture Validations", () => {
    it("should support all required models with ObjectId references", async () => {
      const user = await User.create({
        name: "All Models Tester",
        email: `allmodels_${Date.now()}@uptoskills.com`,
        password: "password123",
      });

      const course = await Course.create({
        id: 8888,
        title: "Advanced System Design",
        tag: "Architecture",
        mentorId: 1,
        league: "Cloud League",
        description: "Distributed architectures.",
      });

      // Lesson & Module
      const moduleDoc = await Module.create({
        courseId: course._id,
        title: "Module 1: CAP Theorem",
        order: 1,
      });
      assert.ok(moduleDoc._id instanceof mongoose.Types.ObjectId);

      const lessonDoc = await Lesson.create({
        courseId: course._id,
        moduleId: moduleDoc._id,
        title: "Understanding Consistency Models",
        duration: "20 min",
      });
      assert.ok(lessonDoc._id instanceof mongoose.Types.ObjectId);

      // LessonProgress
      const progressDoc = await LessonProgress.create({
        userId: user._id,
        courseId: course._id,
        lessonId: lessonDoc._id,
        progress: 100,
        completed: true,
      });
      assert.equal(progressDoc.completed, true);

      // Quiz & QuizAttempt
      const quiz = await Quiz.create({
        leagueId: 88,
        partId: 1,
        title: "System Design Quiz",
        questions: [{ id: 1, question: "What is PACELC?", options: ["A", "B"], answer: 0 }],
      });
      assert.ok(quiz._id instanceof mongoose.Types.ObjectId);

      const quizAttempt = await QuizAttempt.create({
        userId: user._id,
        quizId: quiz._id,
        leagueId: 88,
        partId: 1,
        score: 1,
        maxQuestions: 1,
        earnedXp: 150,
        passed: true,
      });
      assert.equal(quizAttempt.earnedXp, 150);

      // Certificate
      const cert = await Certificate.create({
        userId: user._id,
        courseId: course._id,
        title: course.title,
        verificationCode: `CERT-${Date.now()}`,
      });
      assert.ok(cert._id instanceof mongoose.Types.ObjectId);

      // ForumPost & ForumComment
      const post = await ForumPost.create({
        title: "Scaling WebSockets",
        author: user.name,
        authorId: user._id,
        content: "How to handle 100k active connections?",
      });
      assert.ok(post._id instanceof mongoose.Types.ObjectId);

      const comment = await ForumComment.create({
        postId: post._id,
        author: "Tech Guru",
        authorId: user._id,
        content: "Use Redis PUB/SUB adapters.",
      });
      assert.ok(comment._id instanceof mongoose.Types.ObjectId);

      // Review
      const review = await Review.create({
        courseId: course._id,
        userId: user._id,
        rating: 5,
        comment: "Excellent curriculum!",
      });
      assert.equal(review.rating, 5);

      // Notification
      const notif = await Notification.create({
        userId: user._id,
        title: "Course Completed",
        message: "You have completed Advanced System Design!",
      });
      assert.equal(notif.read, false);

      // ChallengeSubmission & DailyChallenge
      const dc = await DailyChallenge.create({
        id: `dc-${Date.now()}`,
        title: "Two Sum",
        description: "Find indices summing to target",
      });
      assert.ok(dc.id);

      const sub = await ChallengeSubmission.create({
        challengeId: dc.id,
        userId: user._id,
        code: "function twoSum() {}",
        passed: true,
        xpEarned: 200,
      });
      assert.equal(sub.passed, true);
    });
  });

  describe("4. Idempotent Seed Execution", () => {
    it("should run seedDatabase() idempotently without creating duplicates", async () => {
      // First seed run
      await seedDatabase();

      const userCount1 = await User.countDocuments();
      const courseCount1 = await Course.countDocuments();
      const mentorCount1 = await Mentor.countDocuments();
      const quizCount1 = await Quiz.countDocuments();
      const certCount1 = await Certificate.countDocuments();
      const forumCount1 = await ForumPost.countDocuments();

      assert.ok(userCount1 >= 3);
      assert.ok(courseCount1 >= 1);
      assert.ok(mentorCount1 >= 5);

      // Second seed run
      await seedDatabase();

      const userCount2 = await User.countDocuments();
      const courseCount2 = await Course.countDocuments();
      const mentorCount2 = await Mentor.countDocuments();
      const quizCount2 = await Quiz.countDocuments();
      const certCount2 = await Certificate.countDocuments();
      const forumCount2 = await ForumPost.countDocuments();

      assert.equal(userCount2, userCount1, "User count must remain identical on second seed");
      assert.equal(courseCount2, courseCount1, "Course count must remain identical on second seed");
      assert.equal(mentorCount2, mentorCount1, "Mentor count must remain identical on second seed");
      assert.equal(quizCount2, quizCount1, "Quiz count must remain identical on second seed");
      assert.equal(certCount2, certCount1, "Certificate count must remain identical on second seed");
      assert.equal(forumCount2, forumCount1, "Forum count must remain identical on second seed");
    });
  });

  describe("5. Endpoints Backwards Compatibility", () => {
    it("GET /api/courses should return backwards-compatible course array", async () => {
      const res = await request(app).get("/api/courses");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
      assert.ok(res.body.data[0].title);
    });

    it("GET /api/courses/:id should return course with mentor metadata", async () => {
      const res = await request(app).get("/api/courses/1");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data);
      assert.equal(res.body.data.id, 1);
      assert.ok(res.body.data.mentor, "Mentor metadata must be embedded");
    });

    it("GET /api/mentors should return mentor list", async () => {
      const res = await request(app).get("/api/mentors");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it("GET /api/forum should return discussions list", async () => {
      const res = await request(app).get("/api/forum");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it("GET /api/certificates with token should return certificates list", async () => {
      const res = await request(app)
        .get("/api/certificates")
        .set("Authorization", `Bearer ${testUserToken}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it("GET /api/certificates/verify/:code should verify certificate publicly", async () => {
      const res = await request(app).get("/api/certificates/verify/UPTO-PY-8823-XYZ");
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.verified, true);
      assert.ok(res.body.data.title);
    });

    it("GET /api/health should indicate MongoDB Active", async () => {
      const res = await request(app).get("/api/health");
      assert.equal(res.status, 200);
      assert.equal(res.body.database, "MongoDB Active");
    });
  });
});
