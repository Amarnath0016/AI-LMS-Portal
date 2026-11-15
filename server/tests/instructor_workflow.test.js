import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { connectDB, disconnectDB } from "../config/db.js";
import {
  User,
  Course,
  Enrollment,
  Review,
} from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";
import { app } from "../server.js";
import { LESSON_MATERIALS_DIR } from "../middleware/uploadMiddleware.js";

describe("Instructor Workflow & Permissions Integration Tests", () => {
  let mongoServer;
  let testMongoUri;

  let studentUser;
  let studentToken;

  let instructor1User;
  let instructor1Token;

  let instructor2User;
  let instructor2Token;

  let adminUser;
  let adminToken;

  let testCourse;
  let testModuleId;
  let testLessonId;
  let uploadedAttachmentFilename;
  let uploadedAttachmentId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    testMongoUri = mongoServer.getUri();
    process.env.MONGO_URI = testMongoUri;
    await connectDB(testMongoUri);

    await Promise.all([
      User.init(),
      Course.init(),
      Enrollment.init(),
      Review.init(),
    ]);

    // 1. Create Student
    studentUser = await User.create({
      id: 101,
      name: "Sam Student",
      email: "student@uptoskills.com",
      password: "Password123!",
      role: "student",
      isEmailVerified: true,
    });
    studentToken = generateAccessToken({
      _id: studentUser._id.toString(),
      id: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    // 2. Create Instructor 1
    instructor1User = await User.create({
      id: 201,
      name: "Prof. Alan Turing",
      email: "turing@uptoskills.com",
      password: "Password123!",
      role: "instructor",
      isEmailVerified: true,
    });
    instructor1Token = generateAccessToken({
      _id: instructor1User._id.toString(),
      id: instructor1User._id.toString(),
      email: instructor1User.email,
      role: instructor1User.role,
    });

    // 3. Create Instructor 2
    instructor2User = await User.create({
      id: 202,
      name: "Prof. Grace Hopper",
      email: "hopper@uptoskills.com",
      password: "Password123!",
      role: "instructor",
      isEmailVerified: true,
    });
    instructor2Token = generateAccessToken({
      _id: instructor2User._id.toString(),
      id: instructor2User._id.toString(),
      email: instructor2User.email,
      role: instructor2User.role,
    });

    // 4. Create Admin
    adminUser = await User.create({
      id: 301,
      name: "Super Admin",
      email: "admin@uptoskills.com",
      password: "Password123!",
      role: "admin",
      isEmailVerified: true,
    });
    adminToken = generateAccessToken({
      _id: adminUser._id.toString(),
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  after(async () => {
    // Clean up any test uploaded files in LESSON_MATERIALS_DIR
    if (uploadedAttachmentFilename) {
      const filePath = path.join(LESSON_MATERIALS_DIR, uploadedAttachmentFilename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_err) {
          // ignore cleanup errors during test teardown
        }
      }
    }
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe("1. Access Control & Authorization Checks", () => {
    it("rejects unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/instructor/dashboard");
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it("rejects student role accessing instructor routes with 403", async () => {
      const res = await request(app)
        .get("/api/instructor/dashboard")
        .set("Authorization", `Bearer ${studentToken}`);
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it("allows instructor role to access instructor dashboard", async () => {
      const res = await request(app)
        .get("/api/instructor/dashboard")
        .set("Authorization", `Bearer ${instructor1Token}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.totalCourses, 0);
    });
  });

  describe("2. Course CRUD & Ownership Enforcement", () => {
    it("allows instructor to create course in draft state", async () => {
      const res = await request(app)
        .post("/api/instructor/courses")
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          title: "Full-Stack AI Engineering",
          description: "Build intelligent systems with LLMs and Mongoose.",
          tag: "AI & ML",
          league: "Legendary",
          level: "Advanced",
          price: 49.99,
          xp: 250,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, "Full-Stack AI Engineering");
      assert.equal(res.body.data.status, "draft");
      assert.equal(String(res.body.data.instructorId), String(instructor1User._id));

      testCourse = res.body.data;
    });

    it("allows instructor to update own course", async () => {
      const res = await request(app)
        .patch(`/api/instructor/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          description: "Updated description for AI Engineering course.",
          price: 59.99,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.price, 59.99);
      assert.equal(res.body.data.description, "Updated description for AI Engineering course.");
    });

    it("forbids another instructor from updating the course (HTTP 403)", async () => {
      const res = await request(app)
        .patch(`/api/instructor/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${instructor2Token}`)
        .send({
          title: "Malicious Takeover Title",
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /permission|unauthorized/i);
    });

    it("forbids another instructor from deleting the course (HTTP 403)", async () => {
      const res = await request(app)
        .delete(`/api/instructor/courses/${testCourse._id}`)
        .set("Authorization", `Bearer ${instructor2Token}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });
  });

  describe("3. Modules & Lessons Management with Ownership Checks", () => {
    it("allows course owner to add a module", async () => {
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/modules`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          title: "Module 1: Foundations of Machine Learning",
          order: 1,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data._id);
      assert.equal(res.body.data.title, "Module 1: Foundations of Machine Learning");
      testModuleId = res.body.data._id;
    });

    it("forbids non-owner from adding a module (HTTP 403)", async () => {
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/modules`)
        .set("Authorization", `Bearer ${instructor2Token}`)
        .send({
          title: "Unauthorized Module",
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it("allows owner to update module title and order", async () => {
      const res = await request(app)
        .patch(`/api/instructor/courses/${testCourse._id}/modules/${testModuleId}`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          title: "Module 1: Core Mathematical Foundations",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.title, "Module 1: Core Mathematical Foundations");
    });

    it("allows owner to add a lesson to the course", async () => {
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/lessons`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          title: "Lesson 1.1: Gradient Descent Principles",
          duration: "10 mins",
          moduleId: testModuleId,
          moduleTitle: "Module 1: Core Mathematical Foundations",
          script: "Welcome learners. Today we explore how gradient descent optimizes parameters.",
          transcript: "Welcome learners. Today we explore how gradient descent optimizes parameters.",
          pdfNotes: "Gradient descent moves in the opposite direction of the gradient.",
          order: 1,
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data._id);
      assert.equal(res.body.data.title, "Lesson 1.1: Gradient Descent Principles");
      testLessonId = res.body.data._id;
    });

    it("allows owner to update lesson with quiz questions", async () => {
      const res = await request(app)
        .patch(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          duration: "12 mins",
          quizQuestions: [
            {
              question: "What does the learning rate control?",
              options: ["Step size", "Loss function", "Batch size", "Activation function"],
              correctAnswer: 0,
              explanation: "Learning rate determines the step size taken along the gradient.",
            },
          ],
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.duration, "12 mins");
      assert.equal(res.body.data.quizQuestions.length, 1);
      assert.equal(res.body.data.quizQuestions[0].question, "What does the learning rate control?");
    });

    it("allows adding a second lesson and reordering lessons", async () => {
      const addRes = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/lessons`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          title: "Lesson 1.2: Convex Optimization Basics",
          duration: "15 mins",
          moduleId: testModuleId,
          order: 2,
        });
      assert.equal(addRes.status, 201);
      const secondLessonId = addRes.body.data._id;

      // Reorder so lesson 2 is first
      const reorderRes = await request(app)
        .patch(`/api/instructor/courses/${testCourse._id}/lessons-reorder`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .send({
          lessonIds: [secondLessonId, testLessonId],
        });

      assert.equal(reorderRes.status, 200);
      assert.equal(reorderRes.body.success, true);
      const lessons = reorderRes.body.data;
      assert.equal(String(lessons[0]._id), String(secondLessonId));
      assert.equal(String(lessons[1]._id), String(testLessonId));
    });
  });

  describe("4. File Upload (Multer) & Storage Outside Web Root", () => {
    it("rejects malicious file types (.exe, .sh) with 400", async () => {
      const badBuffer = Buffer.from("echo 'evil script'");
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .attach("file", badBuffer, { filename: "malicious_script.sh", contentType: "application/x-sh" });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid file type/i);
    });

    it("forbids non-owner from uploading files to lesson (HTTP 403)", async () => {
      const samplePdf = Buffer.from("%PDF-1.4 sample content");
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments`)
        .set("Authorization", `Bearer ${instructor2Token}`)
        .attach("file", samplePdf, { filename: "unauthorized_slides.pdf", contentType: "application/pdf" });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it("successfully uploads valid material and stores outside web root", async () => {
      const samplePdf = Buffer.from("%PDF-1.4 sample content for AI LMS lesson notes");
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments`)
        .set("Authorization", `Bearer ${instructor1Token}`)
        .attach("file", samplePdf, { filename: "gradient_descent_cheatsheet.pdf", contentType: "application/pdf" });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.filename);
      assert.equal(res.body.data.originalName, "gradient_descent_cheatsheet.pdf");

      uploadedAttachmentFilename = res.body.data.filename;
      uploadedAttachmentId = res.body.data._id;

      // Verify file is stored in server/storage/lesson-materials (outside web root)
      const expectedStoragePath = path.join(LESSON_MATERIALS_DIR, uploadedAttachmentFilename);
      assert.ok(fs.existsSync(expectedStoragePath), "File must physically exist in storage directory");
      assert.ok(expectedStoragePath.includes("storage/lesson-materials"));
      assert.ok(!expectedStoragePath.includes("server/public"));
    });

    it("allows course owner to download uploaded attachment", async () => {
      const res = await request(app)
        .get(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments/${uploadedAttachmentFilename}`)
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.headers["content-type"], "application/pdf");
    });

    it("forbids non-enrolled student from downloading lesson attachment (HTTP 403)", async () => {
      const res = await request(app)
        .get(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments/${uploadedAttachmentFilename}`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /must be enrolled/i);
    });

    it("allows enrolled student to download lesson attachment", async () => {
      // Enroll student in course
      await Enrollment.create({
        userId: studentUser._id,
        courseId: testCourse._id,
        progress: 10,
        enrolledAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments/${uploadedAttachmentFilename}`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.headers["content-type"], "application/pdf");
    });
  });

  describe("5. Course Submission, Rejection, and Admin Approval Workflow", () => {
    it("allows instructor to submit course for review -> status pending", async () => {
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/submit`)
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "pending");
    });

    it("forbids regular instructor from approving or rejecting courses", async () => {
      const res = await request(app)
        .patch(`/api/admin/courses/${testCourse._id}/approve`)
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 403);
    });

    it("allows admin to reject course with feedback & reviewer info", async () => {
      const res = await request(app)
        .patch(`/api/admin/courses/${testCourse._id}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          reason: "Please expand Lesson 1.2 with real code examples and practice exercises.",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "rejected");
      assert.equal(res.body.data.rejectionReason, "Please expand Lesson 1.2 with real code examples and practice exercises.");
      assert.equal(res.body.data.reviewerEmail, adminUser.email);
      assert.ok(res.body.data.reviewedAt);
    });

    it("shows rejection reason on instructor dashboard", async () => {
      const res = await request(app)
        .get("/api/instructor/dashboard")
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.rejectedCourses, 1);
      const rejectedCourse = res.body.data.courses.find((c) => String(c._id) === String(testCourse._id));
      assert.ok(rejectedCourse);
      assert.equal(rejectedCourse.rejectionReason, "Please expand Lesson 1.2 with real code examples and practice exercises.");
    });

    it("allows instructor to resubmit course for review after fixes", async () => {
      const res = await request(app)
        .post(`/api/instructor/courses/${testCourse._id}/submit`)
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, "pending");
    });

    it("allows admin to approve course with reviewer tracking", async () => {
      const res = await request(app)
        .patch(`/api/admin/courses/${testCourse._id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          feedback: "Great additions! Course meets all platform quality standards.",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "approved");
      assert.equal(res.body.data.reviewerEmail, adminUser.email);
      assert.equal(res.body.data.reviewFeedback, "Great additions! Course meets all platform quality standards.");
    });
  });

  describe("6. Instructor Dashboard Metrics with Real DB Aggregations", () => {
    it("accurately computes total students, ratings, and course counts", async () => {
      // Add a review for the approved course
      await Review.create({
        courseId: testCourse._id,
        userId: studentUser._id,
        userName: studentUser.name,
        rating: 5,
        comment: "Outstanding course on AI engineering!",
        createdAt: new Date(),
      });

      const res = await request(app)
        .get("/api/instructor/dashboard")
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.totalCourses, 1);
      assert.equal(res.body.data.approvedCourses, 1);
      assert.equal(res.body.data.pendingCourses, 0);
      assert.equal(res.body.data.draftCourses, 0);
      assert.equal(res.body.data.rejectedCourses, 0);
      assert.equal(res.body.data.totalStudents, 1);
      assert.equal(res.body.data.avgRating, 5.0);
    });
  });

  describe("7. Lesson Attachment Deletion and Cleanup", () => {
    it("forbids non-owner from deleting attachment (HTTP 403)", async () => {
      const res = await request(app)
        .delete(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments/${uploadedAttachmentId}`)
        .set("Authorization", `Bearer ${instructor2Token}`);

      assert.equal(res.status, 403);
    });

    it("allows course owner to delete attachment and removes file from disk", async () => {
      const filePath = path.join(LESSON_MATERIALS_DIR, uploadedAttachmentFilename);
      assert.ok(fs.existsSync(filePath), "Attachment should exist before deletion");

      const res = await request(app)
        .delete(`/api/instructor/courses/${testCourse._id}/lessons/${testLessonId}/attachments/${uploadedAttachmentId}`)
        .set("Authorization", `Bearer ${instructor1Token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(!fs.existsSync(filePath), "Attachment file should be deleted from disk");
    });
  });
});
