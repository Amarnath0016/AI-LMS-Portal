import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../config/db.js";
import { User, Mentor } from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";
import { app } from "../server.js";
import {
  computePhoneticVisemes,
  getMentorAvatarConfig,
} from "../services/avatarAnimationService.js";
import avatarAnimationService from "../services/avatarAnimationService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVATAR_ASSETS_DIR = path.resolve(__dirname, "../public/avatars");

describe("Talking Avatar (Option B: Self-Contained) & Real Viseme Test Suite", () => {
  let mongoServer;
  let testMentor;
  let unconsentedMentor;
  let studentUser;
  let studentToken;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;

    await connectDB(mongoUri);

    const passwordHash = await bcrypt.hash("Password123!", 10);
    studentUser = await User.create({
      name: "Avatar Tester",
      email: "avatar.tester@example.com",
      password: passwordHash,
      role: "student",
      status: "Active",
    });

    studentToken = generateAccessToken({
      id: studentUser._id,
      role: studentUser.role,
      email: studentUser.email,
    });

    testMentor = await Mentor.create({
      id: 31,
      name: "Prof. Alan Turing",
      initials: "AT",
      subject: "Theoretical Computer Science",
      tag: "Technology",
      personaPrompt: "You are an AI clone of Alan Turing.",
      avatarSettings: {
        avatarUrl: "/api/ai/avatar-assets/mentor_1.svg",
        avatarType: "svg-canvas-2d",
        isLicensedAvatar: true,
        licenceType: "Commercial Educational License (CC-BY / Authorized Digital Double)",
        consentNotice:
          "Documented pedagogical avatar consent and synthetic likeness agreement on file.",
        modelConfig: {
          skinTone: "#E8BEAC",
          hairColor: "#2C3E50",
          accentColor: "#2563EB",
          suitColor: "#1E293B",
        },
      },
    });

    unconsentedMentor = await Mentor.create({
      id: 32,
      name: "Unlicensed Avatar Mentor",
      initials: "UA",
      subject: "Unlicensed Face",
      tag: "Technology",
      personaPrompt: "Unlicensed avatar mentor.",
      avatarSettings: {
        avatarUrl: "",
        avatarType: "svg-canvas-2d",
        isLicensedAvatar: false,
        licenceType: "None",
        consentNotice: "",
      },
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) await mongoServer.stop();
  });

  it("1. Verifies fake random-intensity generateVisemeTimeline has been deleted", () => {
    assert.equal(
      avatarAnimationService.generateVisemeTimeline,
      undefined,
      "Fake generateVisemeTimeline must be deleted from avatarAnimationService"
    );
  });

  it("2. computePhoneticVisemes deterministically maps phonemes without random intensity values", () => {
    const words = [
      { word: "Welcome", start: 0.0, end: 0.35 },
      { word: "everyone", start: 0.35, end: 0.7 },
      { word: "today", start: 0.7, end: 1.05 },
    ];

    const visemes = computePhoneticVisemes({ words, totalDuration: 1.05 });

    assert.equal(visemes.length, 3);
    assert.equal(visemes[0].word, "Welcome");
    assert.ok(["REST", "AA", "EE", "OH", "UH", "MM"].includes(visemes[0].viseme));

    // Verify determinism: repeating computation returns identical output
    const repeated = computePhoneticVisemes({ words, totalDuration: 1.05 });
    assert.deepEqual(visemes, repeated, "Viseme computation must be 100% deterministic");
  });

  it("3. GET /api/ai/avatar-config/:mentorId returns documented licence and consent information", async () => {
    const res = await request(app).get(`/api/ai/avatar-config/${testMentor.id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const cfg = res.body.data;

    assert.equal(cfg.mentorName, "Prof. Alan Turing");
    assert.equal(cfg.isLicensedAvatar, true);
    assert.equal(
      cfg.licenceType,
      "Commercial Educational License (CC-BY / Authorized Digital Double)"
    );
    assert.ok(
      cfg.consentNotice.includes("Documented pedagogical avatar consent"),
      "Must include documented consent notice"
    );
    assert.ok(
      cfg.avatarUrl.startsWith("/api/ai/avatar-assets/"),
      "Avatar asset must be served locally from backend, not hotlinked"
    );
  });

  it("4. GET /api/ai/avatar-config/:mentorId flags unconsented avatar as isLicensedAvatar: false", async () => {
    const res = await request(app).get(`/api/ai/avatar-config/${unconsentedMentor.id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.isLicensedAvatar, false);
  });

  it("5. GET /api/ai/avatar-assets/:filename serves local avatar assets with correct MIME & CORS", async () => {
    const res = await request(app).get("/api/ai/avatar-assets/mentor_1.svg");

    assert.equal(res.status, 200);
    assert.equal(res.headers["content-type"], "image/svg+xml");
    assert.equal(res.headers["cross-origin-resource-policy"], "cross-origin");
    const content = res.text || (Buffer.isBuffer(res.body) ? res.body.toString("utf-8") : "");
    assert.ok(content.includes("<svg"), "Must return valid SVG image content");
  });

  it("6. GET /api/ai/avatar-assets/:filename returns 404 for non-existent avatar", async () => {
    const res = await request(app).get("/api/ai/avatar-assets/non_existent_avatar.svg");
    assert.equal(res.status, 404);
  });
});
