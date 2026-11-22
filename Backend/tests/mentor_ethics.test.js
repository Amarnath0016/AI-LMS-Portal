import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../server.js";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import { seedMentors } from "../utils/seedData.js";
import { generateAccessToken } from "../utils/jwt.js";
import { getHashedPassword } from "../utils/seedData.js";
import { setGeminiClient } from "../services/aiMentorService.js";

const mockGenAI = {
  getGenerativeModel: (config) => ({
    generateContent: async () => ({
      response: {
        text: () => "First-principles thinking involves boiling things down to fundamental truths.",
      },
    }),
  }),
};

describe("Ethical AI Mentorship, Consent & Activation Test Suite", () => {
  let mongoServer;
  let adminToken;
  let studentToken;
  let testMentor;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = "test-jwt-secret-for-mentor-ethics-2026";
    process.env.DAILY_AI_QUOTA = "100";

    setGeminiClient(mockGenAI);

    await connectDB(uri);

    const passwordHash = getHashedPassword("securePassword123");

    const adminUser = await User.create({
      id: 991,
      name: "Ethics Admin",
      email: "ethics.admin@uptoskills.com",
      password: passwordHash,
      role: "admin",
      status: "Active",
    });

    adminToken = generateAccessToken({
      id: adminUser._id,
      role: adminUser.role,
      email: adminUser.email,
    });

    const studentUser = await User.create({
      id: 992,
      name: "Student Learner",
      email: "student.learner@uptoskills.com",
      password: passwordHash,
      role: "student",
      status: "Active",
    });

    studentToken = generateAccessToken({
      id: studentUser._id,
      role: studentUser.role,
      email: studentUser.email,
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("1. Mentor schema validates legal taxonomy types ('original', 'licensed', 'historical', 'consented-person')", async () => {
    const validMentor = new Mentor({
      id: 101,
      name: "Dr. Valid Persona",
      initials: "VP",
      subject: "Systems Design",
      tag: "Technology",
      type: "original",
      status: "active",
      consentDocUrl: "https://uptoskills.edu/consent/vp.pdf",
      licenseInfo: "Original Character IP",
      personaPrompt: "You are Dr. Valid Persona teaching systems design.",
    });

    await assert.doesNotReject(async () => {
      await validMentor.validate();
    });

    const invalidMentor = new Mentor({
      id: 102,
      name: "Dr. Invalid Persona",
      initials: "IP",
      subject: "Systems Design",
      tag: "Technology",
      type: "unauthorized-clone", // Not in enum
      personaPrompt: "Invalid persona prompt.",
    });

    await assert.rejects(async () => {
      await invalidMentor.validate();
    }, /is not a valid enum value for path `type`/);
  });

  it("2. Model pre-validation rejects activating a mentor without consentDocUrl or licenseInfo", async () => {
    const unconsentedActiveMentor = new Mentor({
      id: 103,
      name: "Unlicensed Mentor",
      initials: "UM",
      subject: "Security",
      tag: "Technology",
      type: "original",
      status: "active",
      consentDocUrl: "",
      licenseInfo: "",
      personaPrompt: "Test unconsented prompt.",
    });

    await assert.rejects(async () => {
      await unconsentedActiveMentor.validate();
    }, /Admin can only activate a mentor if consentDocUrl or licenseInfo is present/);
  });

  it("3. Admin can activate a mentor only when consentDocUrl or licenseInfo is present", async () => {
    const draftMentor = await Mentor.create({
      id: 104,
      name: "Draft Mentor Candidate",
      initials: "DM",
      subject: "Data Engineering",
      tag: "Data",
      type: "original",
      status: "draft",
      consentDocUrl: "",
      licenseInfo: "",
      personaPrompt: "Draft persona prompt.",
    });

    // Attempt 1: Try to activate without consentDocUrl or licenseInfo -> Expect 400
    const failRes = await request(app)
      .patch(`/api/admin/mentors/${draftMentor.id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "active" });

    assert.equal(failRes.status, 400);
    assert.equal(failRes.body.success, false);
    assert.equal(
      failRes.body.message,
      "Admin can only activate a mentor if consentDocUrl or licenseInfo is present."
    );

    // Attempt 2: Activate with consentDocUrl supplied -> Expect 200
    const successRes = await request(app)
      .patch(`/api/admin/mentors/${draftMentor.id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "active",
        consentDocUrl: "https://uptoskills.edu/consent/draft-mentor-signed.pdf",
        licenseInfo: "Commercial Educational Agreement 2026",
      });

    assert.equal(successRes.status, 200);
    assert.equal(successRes.body.success, true);
    assert.equal(successRes.body.data.status, "active");
    assert.equal(
      successRes.body.data.consentDocUrl,
      "https://uptoskills.edu/consent/draft-mentor-signed.pdf"
    );
  });

  it("4. Non-admin users are forbidden from activating mentors (HTTP 403/401)", async () => {
    const forbiddenRes = await request(app)
      .patch("/api/admin/mentors/104/status")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ status: "active" });

    assert.equal(forbiddenRes.status, 403);

    const unauthorizedRes = await request(app)
      .patch("/api/admin/mentors/104/status")
      .send({ status: "active" });

    assert.equal(unauthorizedRes.status, 401);
  });

  it("5. Seed data preserves Ada Lovelace as historical and converts remaining 9 into original fictional mentors", () => {
    assert.equal(seedMentors.length, 10, "Should have 10 seed mentors");

    // Check Ada Lovelace (id: 8)
    const ada = seedMentors.find((m) => m.id === 8);
    assert.ok(ada, "Ada Lovelace must exist in seed data");
    assert.equal(ada.name, "Ada Lovelace");
    assert.equal(ada.type, "historical");
    assert.equal(ada.status, "active");
    assert.ok(ada.consentDocUrl.includes("ada-lovelace-historical.pdf"));
    assert.ok(ada.licenseInfo.includes("Public Domain Historical Figure"));
    assert.ok(ada.disclosureText.includes("Not the historical person"));

    // Check remaining 9 mentors
    const others = seedMentors.filter((m) => m.id !== 8);
    assert.equal(others.length, 9);

    for (const mentor of others) {
      assert.equal(
        mentor.type,
        "original",
        `Mentor ${mentor.name} must be classified as 'original'`
      );
      assert.equal(mentor.status, "active");
      assert.ok(mentor.consentDocUrl && mentor.consentDocUrl.length > 5);
      assert.ok(mentor.licenseInfo && mentor.licenseInfo.length > 5);
      assert.equal(
        mentor.disclosureText,
        "AI-generated mentor. Not the real person.",
        `Mentor ${mentor.name} must have standard disclosureText`
      );
    }
  });

  it("6. Seed mentors contain zero 'You are an AI clone of' prompts and zero living celebrity names", () => {
    const livingCelebrities = [
      "Elon Musk",
      "Sundar Pichai",
      "Oprah Winfrey",
      "Jensen Huang",
      "Virat Kohli",
      "Shah Rukh Khan",
      "Satya Nadella",
      "Mark Zuckerberg",
      "Indra Nooyi",
    ];

    for (const mentor of seedMentors) {
      // 1. No "AI clone of"
      assert.ok(
        !mentor.personaPrompt.includes("You are an AI clone of"),
        `Mentor ${mentor.name} contains forbidden phrase 'You are an AI clone of'`
      );

      // 2. No living celebrity names in mentor.name
      for (const celeb of livingCelebrities) {
        assert.notEqual(
          mentor.name,
          celeb,
          `Mentor name '${mentor.name}' must not impersonate living person '${celeb}'`
        );
      }
    }
  });

  it("7. AI chat reply includes disclosure notice 'AI-generated mentor. Not the real person.'", async () => {
    const activeMentor = await Mentor.create({
      id: 105,
      name: "Dr. Alex Vance",
      initials: "AV",
      subject: "First Principles",
      tag: "Business",
      type: "original",
      status: "active",
      consentDocUrl: "https://uptoskills.edu/consent/alex-vance.pdf",
      licenseInfo: "Original Character IP",
      disclosureText: "AI-generated mentor. Not the real person.",
      personaPrompt: "You are Dr. Alex Vance teaching engineering principles.",
    });

    const chatRes = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        mentorId: activeMentor.id,
        message: "Explain what first-principles thinking means.",
      });

    assert.equal(chatRes.status, 200);
    assert.equal(chatRes.body.success, true);
    assert.equal(
      chatRes.body.data.disclosureText,
      "AI-generated mentor. Not the real person."
    );
  });
});
