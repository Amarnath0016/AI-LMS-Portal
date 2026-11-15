import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../config/db.js";
import {
  User,
  Mentor,
  Course,
  LessonProgress,
  Enrollment,
} from "../models/index.js";
import { generateAccessToken } from "../utils/jwt.js";
import { app } from "../server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, "../public/audio/cache");

describe("Lesson Real TTS, Caching & Playback Position Test Suite", () => {
  let mongoServer;
  let studentUser;
  let studentToken;
  let testMentor;
  let unconsentedMentor;
  let testCourse;
  let testLesson;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;

    await connectDB(mongoUri);

    const passwordHash = await bcrypt.hash("Password123!", 10);
    studentUser = await User.create({
      name: "TTS Student",
      email: "tts.student@example.com",
      password: passwordHash,
      role: "student",
      status: "Active",
      xp: 100,
    });

    studentToken = generateAccessToken({
      id: studentUser._id,
      role: studentUser.role,
      email: studentUser.email,
    });

    testMentor = await Mentor.create({
      id: 21,
      name: "Dr. Maya Lin",
      initials: "ML",
      subject: "Distributed Systems Architecture",
      tag: "Technology",
      personaPrompt: "You are Dr. Maya Lin teaching distributed architecture.",
      voiceSettings: {
        pitch: 1.0,
        rate: 1.0,
        voiceName: "en-US-Neural2-F",
        provider: "google-tts",
        isLicensedClone: false,
        consentNotice: "Licensed pedagogical synthetic voice under verified educational agreement.",
        voiceKeyword: "Samantha",
      },
    });

    unconsentedMentor = await Mentor.create({
      id: 22,
      name: "Unlicensed Clone Persona",
      initials: "UC",
      subject: "Unauthorized Voice",
      tag: "Technology",
      personaPrompt: "Unlicensed voice testing persona.",
      voiceSettings: {
        voiceName: "",
        elevenVoiceId: "",
        consentNotice: "",
        isLicensedClone: false,
      },
    });

    testCourse = await Course.create({
      id: 201,
      title: "Consensus Algorithms in Distributed Systems",
      description: "Learn Raft, Paxos and distributed consensus from certified AI mentors.",
      league: "Architecture League",
      tag: "Technology",
      mentorId: testMentor.id,
      price: 0,
      status: "approved",
      lessons: [
        {
          id: 1,
          title: "Introduction to the Raft Consensus Algorithm",
          duration: "15 min",
          script:
            "Welcome to Raft Consensus. In distributed systems, node failures and network partitions are inevitable.\n\nRaft simplifies consensus by decomposing it into leader election, log replication, and safety guarantees.",
          completed: false,
        },
        {
          id: 2,
          title: "Leader Election and Term Numbers",
          duration: "20 min",
          script: "Nodes start in follower state. If heartbeats timeout, election begins.",
          completed: false,
        },
      ],
    });

    testLesson = testCourse.lessons[0];

    // Enroll student
    await Enrollment.create({
      userId: studentUser._id,
      courseId: testCourse._id,
      progress: 0,
      completed: false,
    });
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) await mongoServer.stop();
  });

  it("1. POST /api/ai/lessons/:lessonId/audio generates audio per script segment with licensed voice & word timestamps", async () => {
    const res = await request(app)
      .post(`/api/ai/lessons/${testLesson._id}/audio`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ mentorId: testMentor.id });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;

    assert.equal(data.mentorName, "Dr. Maya Lin");
    assert.equal(data.isLicensedClone, false);
    assert.ok(data.consentNotice.includes("Licensed pedagogical synthetic voice"));

    // Verify segments and word timestamps
    assert.ok(Array.isArray(data.segments));
    assert.ok(data.segments.length >= 2, "Script should be split into multiple segments");

    const seg1 = data.segments[0];
    assert.ok(seg1.audioUrl.startsWith("/api/ai/audio-files/"));
    assert.ok(seg1.duration > 0);
    assert.ok(Array.isArray(seg1.words));
    assert.ok(seg1.words.length > 0);
    assert.ok(seg1.words[0].word);
    assert.ok(typeof seg1.words[0].start === "number");
    assert.ok(typeof seg1.words[0].end === "number");

    // Verify audio file was saved to disk cache
    const filename = path.basename(seg1.audioUrl);
    const diskPath = path.join(CACHE_DIR, filename);
    assert.ok(fs.existsSync(diskPath), "Audio file must exist in disk cache");
  });

  it("2. Subsequent audio generation requests serve from disk cache (idempotent / cached: true)", async () => {
    const res = await request(app)
      .post(`/api/ai/lessons/${testLesson._id}/audio`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ mentorId: testMentor.id });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;

    // Segments should be retrieved from cache
    for (const seg of data.segments) {
      assert.equal(seg.cached, true, "Segment should be flagged as cached");
    }
  });

  it("3. GET /api/ai/audio-files/:filename serves audio with correct headers and CORS policy", async () => {
    // Generate audio first to guarantee cache exists
    const genRes = await request(app)
      .post(`/api/ai/lessons/${testLesson._id}/audio`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ mentorId: testMentor.id });

    const audioUrl = genRes.body.data.segments[0].audioUrl;
    const filename = path.basename(audioUrl);

    const res = await request(app).get(`/api/ai/audio-files/${filename}`);

    assert.equal(res.status, 200);
    assert.equal(res.headers["content-type"], "audio/wav");
    assert.equal(res.headers["accept-ranges"], "bytes");
    assert.equal(res.headers["cross-origin-resource-policy"], "cross-origin");
  });

  it("4. Rejects audio generation with 403 when mentor voice has no licensed consent configured", async () => {
    const res = await request(app)
      .post(`/api/ai/lessons/${testLesson._id}/audio`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ mentorId: unconsentedMentor.id });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes("No licensed or consented voice"));
  });

  it("5. Saves and returns resume position via POST /api/lessons/:id/position", async () => {
    const res = await request(app)
      .post(`/api/lessons/${testLesson._id}/position`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        courseId: testCourse._id,
        currentTime: 42.5,
        progressPercent: 45,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.playbackPositionSeconds, 42.5);
    assert.equal(res.body.data.progress, 45);
    assert.equal(res.body.data.completed, false);

    // Verify GET retrieves position
    const getRes = await request(app)
      .get(`/api/lessons/${testLesson._id}/position?courseId=${testCourse._id}`)
      .set("Authorization", `Bearer ${studentToken}`);

    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.playbackPositionSeconds, 42.5);
    assert.equal(getRes.body.data.progress, 45);
  });

  it("6. Auto-completes lesson and awards +50 XP when watched progress reaches >=90%", async () => {
    const userBefore = await User.findById(studentUser._id);
    const xpBefore = userBefore.xp;

    const res = await request(app)
      .post(`/api/lessons/${testLesson._id}/position`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        courseId: testCourse._id,
        currentTime: 85.0,
        progressPercent: 92,
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.completed, true);
    assert.equal(res.body.data.progress, 100);
    assert.equal(res.body.data.earnedXp, 50);

    // Verify User gained +50 XP
    const userAfter = await User.findById(studentUser._id);
    assert.equal(userAfter.xp, xpBefore + 50);

    // Verify Enrollment progress updated
    const enrollment = await Enrollment.findOne({
      userId: studentUser._id,
      courseId: testCourse._id,
    });
    assert.equal(enrollment.progress, 50); // 1 of 2 lessons completed = 50%
  });

  it("7. GET /api/ai/voice-profile/:mentorId returns DB voice settings without hardcoded clone claims", async () => {
    const res = await request(app).get(`/api/ai/voice-profile/${testMentor.id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const v = res.body.data;
    assert.equal(v.mentorName, "Dr. Maya Lin");
    assert.equal(v.isLicensedClone, false);
    assert.equal(v.voiceName, "en-US-Neural2-F");
    assert.ok(v.consentNotice.includes("Licensed pedagogical synthetic voice"));
  });
});
