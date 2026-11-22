import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../config/db.js";
import {
  User,
  DailyChallenge,
  ChallengeSubmission,
} from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";
import { app } from "../server.js";

describe("Daily Challenge Sandbox Evaluation & Security Tests", () => {
  let mongoServer;
  let testMongoUri;

  let studentUser;
  let studentToken;

  let challenge1;
  let challenge2;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    testMongoUri = mongoServer.getUri();
    process.env.MONGO_URI = testMongoUri;
    await connectDB(testMongoUri);

    await Promise.all([
      User.init(),
      DailyChallenge.init(),
      ChallengeSubmission.init(),
    ]);

    // Create test student user with 100 XP and streak 1
    studentUser = await User.create({
      id: 501,
      name: "Dev Learner",
      email: "devlearner@uptoskills.com",
      password: "Password123!",
      role: "student",
      xp: 100,
      streak: 1,
      isEmailVerified: true,
    });
    studentToken = generateAccessToken({
      _id: studentUser._id.toString(),
      id: studentUser._id.toString(),
      email: studentUser.email,
      role: studentUser.role,
    });

    // Create challenge 1: Two Sum with visible and hidden test cases
    challenge1 = await DailyChallenge.create({
      id: "dc-twosum-test",
      title: "Two Sum Target Index Pair",
      difficulty: "Easy",
      category: "Algorithms",
      xpReward: 200,
      streakBonus: 50,
      functionName: "twoSum",
      date: new Date().toISOString().split("T")[0],
      description: "Find two indices that sum up to target.",
      starterCode: "function twoSum(nums, target) {\n  // your code\n}",
      testCases: [
        {
          name: "Test 1: Standard positive indices",
          input: [[2, 7, 11, 15], 9],
          expected: [0, 1],
        },
        {
          name: "Test 2: Elements in middle",
          input: [[3, 2, 4], 6],
          expected: [1, 2],
        },
      ],
      hiddenTestCases: [
        {
          name: "Hidden Test 1: Duplicate values",
          input: [[3, 3], 6],
          expected: [0, 1],
        },
        {
          name: "Hidden Test 2: Negative numbers",
          input: [[-1, -2, -3, -4, -5], -8],
          expected: [2, 4],
        },
      ],
      hints: [
        { hint: "Use a hash map or Map to store complements in O(N) time.", cost: 10 },
        { hint: "Check if target - current exists before inserting.", cost: 10 },
      ],
      active: true,
      participants: 50,
    });

    // Create challenge 2: Debounce function with async testCode assertions
    challenge2 = await DailyChallenge.create({
      id: "dc-debounce-test",
      title: "Build Debounce Function",
      difficulty: "Medium",
      category: "JavaScript",
      xpReward: 250,
      streakBonus: 50,
      functionName: "debounce",
      date: "2026-01-01",
      description: "Implement debounce with leading/trailing option.",
      starterCode: "function debounce(func, wait, immediate = false) {}",
      testCases: [
        {
          name: "Test 1: Returns a function wrapper",
          testCode: "const d = debounce(() => {}, 50); return typeof d === 'function';",
          expected: true,
        },
      ],
      hiddenTestCases: [
        {
          name: "Hidden Test 1: Immediate execution edge",
          testCode: "let count = 0; const d = debounce(() => { count++; }, 50, true); d(); return count === 1;",
          expected: true,
        },
      ],
      hints: [{ hint: "Clear timeout before re-arming.", cost: 10 }],
      active: true,
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe("1. Hidden Test Cases & Hint Data Protection", () => {
    it("GET /api/challenges/today returns visible test cases but NEVER leaks hidden test cases", async () => {
      const res = await request(app)
        .get("/api/challenges/today")
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.testCases);
      assert.equal(res.body.data.testCases.length, 2);
      assert.equal(res.body.data.hiddenTestCases, undefined);
    });

    it("GET /api/challenges/:id hides locked hint text until purchased", async () => {
      const res = await request(app)
        .get(`/api/challenges/${challenge1.id}`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.hints.length, 2);
      assert.equal(res.body.data.hints[0].unlocked, false);
      assert.equal(res.body.data.hints[0].hint, null);
      assert.equal(res.body.data.hints[0].cost, 10);
    });
  });

  describe("2. Real Code Sandbox Execution (Run Tests vs Submit)", () => {
    it("POST /api/challenges/:id/run tests visible test cases without awarding XP", async () => {
      const correctCode = `
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const diff = target - nums[i];
            if (map.has(diff)) return [map.get(diff), i];
            map.set(nums[i], i);
          }
        }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/run`)
        .send({ code: correctCode });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.passed, true);
      assert.equal(res.body.results.length, 2);
      assert.equal(res.body.results[0].passed, true);
      assert.ok(res.body.results[0].executionTimeMs !== undefined);

      // Verify user XP and streak were NOT modified by 'run'
      const user = await User.findById(studentUser._id);
      assert.equal(user.xp, 100);
      assert.equal(user.streak, 1);
    });

    it("POST /api/challenges/:id/submit fails when code fails hidden test cases", async () => {
      // Flawed implementation: fails on duplicate values and negative numbers
      const flawedCode = `
        function twoSum(nums, target) {
          if (nums[0] === 2 && nums[1] === 7) return [0, 1];
          if (nums[0] === 3 && nums[1] === 2) return [1, 2];
          return [-1, -1];
        }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: flawedCode, language: "javascript" });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.passed, false);
      assert.equal(res.body.xpEarned, 0);

      // Verify user XP did NOT increase
      const user = await User.findById(studentUser._id);
      assert.equal(user.xp, 100);
    });

    it("POST /api/challenges/:id/submit succeeds on full correct solution and awards XP server-side", async () => {
      const fullSolution = `
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const comp = target - nums[i];
            if (map.has(comp)) return [map.get(comp), i];
            map.set(nums[i], i);
          }
        }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: fullSolution, language: "javascript" });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.passed, true);
      assert.equal(res.body.xpEarned, 200); // base reward

      // Verify user XP was updated in DB
      const user = await User.findById(studentUser._id);
      assert.equal(user.xp, 300); // 100 initial + 200 reward
    });

    it("prevents duplicate XP farming on the same day", async () => {
      const fullSolution = `
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const comp = target - nums[i];
            if (map.has(comp)) return [map.get(comp), i];
            map.set(nums[i], i);
          }
        }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: fullSolution });

      assert.equal(res.status, 200);
      assert.equal(res.body.passed, true);
      assert.equal(res.body.alreadyCompletedToday, true);
      assert.equal(res.body.xpEarned, 0); // No duplicate XP!

      // Verify DB was not inflated
      const user = await User.findById(studentUser._id);
      assert.equal(user.xp, 300);
    });
  });

  describe("3. Security & Malicious Code Containment in Sandbox", () => {
    it("safely handles infinite loops via execution timeout without crashing or hanging server", async () => {
      const infiniteLoopCode = `
        function twoSum(nums, target) {
          while (true) {}
        }
      `;

      const start = Date.now();
      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: infiniteLoopCode });

      const elapsed = Date.now() - start;
      assert.equal(res.status, 200);
      assert.equal(res.body.passed, false);
      assert.match(res.body.message, /Time Limit Exceeded/i);
      // Timeout should trigger within reasonable window (~3.5s)
      assert.ok(elapsed < 6000, "Should terminate infinite loop within timeout threshold");

      // Verify server remains responsive
      const healthRes = await request(app).get("/api/health");
      assert.equal(healthRes.status, 200);
    });

    it("blocks malicious filesystem access attempts (require('fs') or readFileSync)", async () => {
      const maliciousFsCode = `
        const fs = require('fs');
        const env = fs.readFileSync('.env', 'utf8');
        function twoSum() { return [0, 1]; }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: maliciousFsCode });

      assert.equal(res.status, 200);
      assert.equal(res.body.passed, false);
      assert.match(res.body.message, /require is not defined/i);
    });

    it("blocks process.exit attempts and protects server process", async () => {
      const maliciousExitCode = `
        process.exit(1);
        function twoSum() { return [0, 1]; }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: maliciousExitCode });

      assert.equal(res.status, 200);
      assert.equal(res.body.passed, false);
      assert.match(res.body.message, /process is not defined/i);

      // Verify server is alive and unaffected
      const healthRes = await request(app).get("/api/health");
      assert.equal(healthRes.status, 200);
    });

    it("blocks dynamic string code compilation (new Function / eval)", async () => {
      const evalCode = `
        const badFn = new Function('return 42');
        function twoSum() { return [0, 1]; }
      `;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code: evalCode });

      assert.equal(res.status, 200);
      assert.equal(res.body.passed, false);
      assert.match(res.body.message, /disallowed/i);
    });
  });

  describe("4. Server-Side Hint Unlocking & XP Deductions", () => {
    it("deducts 10 XP server-side when unlocking a hint and reveals hint text", async () => {
      const initialUser = await User.findById(studentUser._id);
      const startingXp = initialUser.xp;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/hints/0/unlock`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.unlocked, true);
      assert.equal(res.body.cost, 10);
      assert.equal(res.body.currentXp, startingXp - 10);
      assert.ok(res.body.hint.includes("hash map"));

      // Check DB persistence
      const updatedUser = await User.findById(studentUser._id);
      assert.equal(updatedUser.xp, startingXp - 10);
      assert.equal(updatedUser.unlockedHints.length, 1);
    });

    it("is idempotent: re-unlocking an already unlocked hint does not deduct XP again", async () => {
      const initialUser = await User.findById(studentUser._id);
      const startingXp = initialUser.xp;

      const res = await request(app)
        .post(`/api/challenges/${challenge1.id}/hints/0/unlock`)
        .set("Authorization", `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.alreadyUnlocked, true);
      assert.equal(res.body.cost, 0);
      assert.equal(res.body.currentXp, startingXp);

      const userAfter = await User.findById(studentUser._id);
      assert.equal(userAfter.xp, startingXp);
    });
  });

  describe("5. AI Code Evaluation is Strictly Advisory", () => {
    it("POST /api/ai/evaluate-code returns advisory feedback and NEVER awards XP or completes challenge", async () => {
      const code = "function twoSum(nums, target) { return [0, 1]; }";

      const res = await request(app)
        .post("/api/ai/evaluate-code")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ code, language: "javascript", problemTitle: "Two Sum" });

      // If Gemini API is available or mock fallback
      assert.ok(res.status === 200 || res.status === 503);
      if (res.status === 200) {
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.isAdvisory, true);
        assert.ok(res.body.data.disclaimer);
      }

      // Verify no challenge submission was auto-created or marked as passed
      const submission = await ChallengeSubmission.findOne({
        userId: studentUser._id,
        challengeId: challenge2.id,
      });
      assert.equal(submission, null);
    });
  });
});
