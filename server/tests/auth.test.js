import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Set environment variables before module evaluation
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_super_secret_jwt_key_that_is_at_least_32_characters_long";
process.env.JWT_REFRESH_SECRET = "test_super_secret_refresh_jwt_key_that_is_at_least_32_characters_long";
process.env.ADMIN_ACCESS_CODE = "123456";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

import { app } from "../server.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { User, InstructorApplication } from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";

describe("UptoSkills Security & Auth Hardening Tests", () => {
  let mongoServer;
  let studentUser;
  let adminUser;
  let studentToken;
  let adminToken;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    await connectDB(uri);

    // Reset demo accounts to pristine state for repeatable test runs
    studentUser = await User.findOneAndUpdate(
      { email: "shailesh@uptoskills.com" },
      {
        $set: {
          id: 1,
          name: "Shailesh Chaudhari",
          email: "shailesh@uptoskills.com",
          role: "student",
          status: "Active",
          bio: "Aspiring software developer",
          xp: 17111,
          password: await bcrypt.hash("student123", 10),
          resetOtpHash: null,
          resetOtpExpiresAt: null,
          resetOtpUsed: false,
        },
      },
      { upsert: true, new: true }
    );

    adminUser = await User.findOneAndUpdate(
      { email: "admin@uptoskills.com" },
      {
        $set: {
          id: 2,
          name: "Admin User",
          email: "admin@uptoskills.com",
          role: "admin",
          status: "Active",
          password: await bcrypt.hash("admin123", 10),
        },
      },
      { upsert: true, new: true }
    );

    assert.ok(studentUser, "Demo student must exist in database");
    assert.ok(adminUser, "Demo admin must exist in database");
    assert.equal(studentUser.role, "student");
    assert.equal(adminUser.role, "admin");

    studentToken = generateAccessToken({
      id: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    adminToken = generateAccessToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // 1. Unauthenticated access returns 401
  describe("1. Unauthenticated access returns 401", () => {
    it("should return 401 when accessing protected route /api/admin/users without token", async () => {
      const res = await request(app).get("/api/admin/users");
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /no token provided/i);
    });

    it("should return 401 when accessing protected route /api/auth/me without token", async () => {
      const res = await request(app).get("/api/auth/me");
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /no token provided/i);
    });

    it("should return 401 when token is malformed", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", "Bearer invalid-token-string");
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /malformed or expired/i);
    });

    it("should return 401 when token has expired", async () => {
      const expiredToken = jwt.sign(
        { id: studentUser._id.toString(), email: studentUser.email, role: "student" },
        process.env.JWT_SECRET,
        { expiresIn: "0s" }
      );
      // Wait tiny bit to guarantee expiration
      await new Promise((r) => setTimeout(r, 100));

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it("should return 401 when token references a non-existent user", async () => {
      const ghostToken = generateAccessToken({
        id: new mongoose.Types.ObjectId().toString(),
        email: "ghost@example.com",
        role: "admin",
      });
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${ghostToken}`);
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /user account not found/i);
    });

    it("should return 401 when user account status is Suspended/Inactive", async () => {
      const suspendedUser = await User.create({
        name: "Suspended Learner",
        email: "suspended@uptoskills.com",
        password: "hashedpassword",
        role: "student",
        status: "Suspended",
      });

      const suspendedToken = generateAccessToken({
        id: suspendedUser._id.toString(),
        email: suspendedUser.email,
        role: suspendedUser.role,
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${suspendedToken}`);
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /inactive or suspended/i);
    });
  });

  // 2. Student gets 403 on admin routes
  describe("2. Student gets 403 on admin routes", () => {
    it("should return 403 when a student accesses GET /api/admin/users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${studentToken}`);
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /forbidden.*admin/i);
    });

    it("should return 403 when a student accesses POST /api/admin/users/invite", async () => {
      const res = await request(app)
        .post("/api/admin/users/invite")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ name: "Hacker", email: "hacker@test.com", role: "admin" });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /forbidden.*admin/i);
    });

    it("should return 403 when a student accesses GET /api/admin/analytics", async () => {
      const res = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${studentToken}`);
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /forbidden.*admin/i);
    });

    it("should return 403 when a student attempts to create a course (requires instructor/admin)", async () => {
      const res = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          title: "Malicious Course",
          tag: "Exploit",
          level: "Beginner",
          description: "Trying to bypass role check",
        });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /forbidden.*instructor/i);
    });

    it("should allow an admin with valid admin token to access /api/admin/users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  // 3. Role escalation via register/profile is blocked
  describe("3. Role escalation via register/profile is blocked", () => {
    it("should ignore client-supplied role on register and always force 'student'", async () => {
      const testEmail = `attacker_${Date.now()}@test.com`;
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Attacker User",
          email: testEmail,
          password: "password12345",
          role: "admin", // Client tries to escalate
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.user.role, "student", "Role must be student regardless of input");

      // Verify in DB
      const created = await User.findOne({ email: testEmail });
      assert.equal(created.role, "student");
    });

    it("should reject register when password is shorter than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Short Pass",
          email: "shortpass@test.com",
          password: "short", // Only 5 chars
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /at least 8 characters/i);
    });

    it("should reject register when email format is invalid", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Bad Email",
          email: "not-an-email",
          password: "password12345",
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /valid email/i);
    });

    it("should block privilege escalation via PATCH /api/auth/profile", async () => {
      const res = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          role: "admin", // Trying to self-upgrade
          xp: 9999999, // Trying to tamper with gamification
          status: "SuperAdmin",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      // The returned user must NOT have escalated role or xp
      assert.equal(res.body.user.role, "student");
      assert.equal(res.body.user.xp, 17111);

      // Verify in DB directly
      const refreshed = await User.findById(studentUser._id);
      assert.equal(refreshed.role, "student");
      assert.equal(refreshed.xp, 17111);
    });
  });

  // 4. Login authentication hardening
  describe("4. Login authentication hardening", () => {
    it("should reject non-existent user without auto-creating a demo account", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "ghost_nonexistent_user@uptoskills.com",
          password: "somepassword",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid email or password/i);

      // Verify no user was created
      const check = await User.findOne({ email: "ghost_nonexistent_user@uptoskills.com" });
      assert.equal(check, null);
    });

    it("should reject incorrect password without fallback bypass", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "shailesh@uptoskills.com",
          password: "wrong_password_attempt",
        });

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid email or password/i);
    });

    it("should succeed with valid student credentials and return token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "shailesh@uptoskills.com",
          password: "student123",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token, "Must return accessToken");
      assert.equal(res.body.user.email, "shailesh@uptoskills.com");
      assert.equal(res.body.user.role, "student");
      assert.equal(res.body.user.password, undefined, "Password must not be leaked");
    });

    it("should reject admin login if admin access code is missing or incorrect", async () => {
      // 1. Missing code
      const resMissing = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@uptoskills.com",
          password: "admin123",
        });

      assert.equal(resMissing.status, 401);
      assert.match(resMissing.body.message, /admin access code/i);

      // 2. Incorrect code
      const resWrong = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@uptoskills.com",
          password: "admin123",
          adminCode: "000000", // Wrong code
        });

      assert.equal(resWrong.status, 401);
      assert.match(resWrong.body.message, /admin access code/i);
    });

    it("should allow admin login when valid credentials and correct admin access code are provided", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@uptoskills.com",
          password: "admin123",
          adminCode: "123456",
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.token);
      assert.equal(res.body.user.role, "admin");
    });
  });

  // 5. Instructor application workflow
  describe("5. Instructor application flow (admin approval only)", () => {
    let applicantUser;
    let applicantToken;

    before(async () => {
      const applicantEmail = `applicant_${Date.now()}@uptoskills.com`;

      applicantUser = await User.create({
        name: "Instructor Candidate",
        email: applicantEmail,
        password: await bcrypt.hash("applicantPass123", 10),
        role: "student",
        status: "Active",
      });

      applicantToken = generateAccessToken({
        id: applicantUser._id.toString(),
        email: applicantUser.email,
        role: applicantUser.role,
      });
    });

    it("should allow a student to submit an application to become an instructor", async () => {
      const res = await request(app)
        .post("/api/auth/apply-instructor")
        .set("Authorization", `Bearer ${applicantToken}`)
        .send({
          subjects: "Fullstack JavaScript & AI",
          experience: "5 years building cloud applications",
          bio: "Passionate about mentoring learners in modern web development.",
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "pending");
    });

    it("should allow admin to review and approve the application, upgrading user role to instructor", async () => {
      // Admin fetches applications
      const appsRes = await request(app)
        .get("/api/admin/instructor-applications")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(appsRes.status, 200);
      assert.ok(appsRes.body.data.length > 0);

      const targetApp = appsRes.body.data.find(
        (a) => String(a.userId) === String(applicantUser._id) && a.status === "pending"
      );
      assert.ok(targetApp, "Pending application should exist for applicant");

      // Admin approves application
      const approveRes = await request(app)
        .patch(`/api/admin/instructor-applications/${targetApp._id || targetApp.id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      assert.equal(approveRes.status, 200);
      assert.equal(approveRes.body.success, true);
      assert.equal(approveRes.body.user.role, "instructor");

      // Verify in DB
      const upgraded = await User.findById(applicantUser._id);
      assert.equal(upgraded.role, "instructor");

      // Verify upgraded instructor can now create courses
      const upgradedToken = generateAccessToken({
        id: upgraded._id.toString(),
        email: upgraded.email,
        role: upgraded.role,
      });

      const courseRes = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${upgradedToken}`)
        .send({
          title: "Production Node.js & Docker Masterclass",
          tag: "Backend",
          level: "Intermediate",
          league: "Backend League",
          mentorId: 2,
          description: "Hands-on guide to containerizing microservices.",
        });

      assert.equal(courseRes.status, 201);
      assert.equal(courseRes.body.success, true);
      assert.equal(courseRes.body.data.status, "pending", "New instructor course defaults to pending review");
    });
  });

  // 6. Real OTP and password reset security
  describe("6. Real OTP and password reset security", () => {
    it("should reject arbitrary OTPs (remove any 6-digit OTP bypass)", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({
          email: "shailesh@uptoskills.com",
          otp: "123456", // Arbitrary OTP without requested reset
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid or expired/i);
    });

    it("should store hashed OTP on forgot-password, verify it, and enforce single-use", async () => {
      // 1. Request OTP
      const forgotRes = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "shailesh@uptoskills.com" });

      assert.equal(forgotRes.status, 200);
      assert.equal(forgotRes.body.success, true);

      // 2. Fetch user from DB to verify hash was saved
      const user = await User.findOne({ email: "shailesh@uptoskills.com" });
      assert.ok(user.resetOtpHash, "resetOtpHash must be stored on user");
      assert.ok(user.resetOtpExpiresAt, "resetOtpExpiresAt must be stored on user");
      assert.equal(user.resetOtpUsed, false);

      // 3. Reject wrong OTP
      const wrongOtpRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "shailesh@uptoskills.com", otp: "000000" });
      assert.equal(wrongOtpRes.status, 400);

      // 4. Test deterministic hashed OTP verification
      const testOtp = "789123";
      const testHash = await bcrypt.hash(testOtp, 10);
      await User.findByIdAndUpdate(user._id, {
        $set: {
          resetOtpHash: testHash,
          resetOtpExpiresAt: new Date(Date.now() + 600000).toISOString(),
          resetOtpUsed: false,
        },
      });

      // Verify OTP succeeds
      const verifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "shailesh@uptoskills.com", otp: testOtp });

      assert.equal(verifyRes.status, 200);
      assert.equal(verifyRes.body.success, true);

      // 5. Verify single-use: repeating with the same OTP should now fail
      const repeatVerifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "shailesh@uptoskills.com", otp: testOtp });

      assert.equal(repeatVerifyRes.status, 400);
      assert.match(repeatVerifyRes.body.message, /already been used/i);
    });
  });
});
