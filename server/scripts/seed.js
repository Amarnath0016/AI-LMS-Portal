import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB, { disconnectDB } from "../config/db.js";
import {
  User,
  Mentor,
  Course,
  Lesson,
  Module,
  Enrollment,
  Quiz,
  Certificate,
  ForumPost,
  ForumComment,
  DailyChallenge,
} from "../models/index.js";
import { indexCourseLessonChunks } from "../utils/retrievalUtils.js";
import {
  seedMentors,
  seedCourses,
  seedUsers,
  seedQuizzes,
  seedCertificates,
  seedForumPosts,
} from "../utils/seedData.js";

const demoChallenges = [
  {
    id: "dc-2026-07-19",
    title: "Build a Debounce Function with Immediate Execution Option",
    difficulty: "Medium",
    category: "JavaScript / Frontend Engineering",
    xpReward: 200,
    streakBonus: 50,
    description: "Implement a debounce function that delays execution until wait ms have elapsed, with immediate option support.",
    starterCode: "function debounce(func, wait, immediate = false) {\n  let timeout = null;\n  return function (...args) {\n    // your code here\n  };\n}",
    testCases: [
      { input: "debounce(fn, 100)", expected: "Function returned" },
      { input: "immediate = true", expected: "Called on leading edge" },
    ],
  },
];

export const seedDatabase = async () => {
  console.log("==================================================");
  console.log("🌱 UPTO-SKILLS LMS - IDEMPOTENT MONGOOSE SEED SCRIPT");
  console.log("==================================================");

  await connectDB();

  // 1. Seed Mentors
  console.log("\n[1/7] Seeding AI Mentors...");
  const mentorDocs = [];
  for (const m of seedMentors) {
    const doc = await Mentor.findOneAndUpdate(
      { id: m.id },
      { $set: m },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    mentorDocs.push(doc);
  }
  console.log(`✔ Seeded ${mentorDocs.length} AI Mentors.`);

  // 2. Seed Users
  console.log("\n[2/7] Seeding Demo Users...");
  const userDocs = [];
  for (const u of seedUsers) {
    let passwordHash = u.password;
    // If password in seedData is not already bcrypt hashed, hash it
    if (!passwordHash.startsWith("$2a$") && !passwordHash.startsWith("$2b$")) {
      passwordHash = await bcrypt.hash(passwordHash, 10);
    }

    const userData = {
      ...u,
      password: passwordHash,
      email: u.email.toLowerCase(),
      status: u.status || "Active",
    };

    const doc = await User.findOneAndUpdate(
      { email: u.email.toLowerCase() },
      { $set: userData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    userDocs.push(doc);
    console.log(`✔ Seeded user (${doc.role}): ${doc.email}`);
  }

  // 3. Seed Courses, Modules & Lessons
  console.log("\n[3/7] Seeding Courses & Modules/Lessons...");
  const courseDocs = [];
  for (const c of seedCourses) {
    const { lessons, ...courseDetails } = c;

    const courseDoc = await Course.findOneAndUpdate(
      { id: c.id },
      { $set: { ...courseDetails, lessons: lessons || [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    courseDocs.push(courseDoc);

    // Create / update Module & Lesson relational models
    const moduleDoc = await Module.findOneAndUpdate(
      { courseId: courseDoc._id, title: `${c.title} - Core Curriculum` },
      {
        $set: {
          courseId: courseDoc._id,
          title: `${c.title} - Core Curriculum`,
          description: c.description,
          order: 1,
        },
      },
      { upsert: true, new: true }
    );

    if (Array.isArray(lessons)) {
      for (let i = 0; i < lessons.length; i++) {
        const l = lessons[i];
        await Lesson.findOneAndUpdate(
          { courseId: courseDoc._id, title: l.title },
          {
            $set: {
              courseId: courseDoc._id,
              moduleId: moduleDoc._id,
              title: l.title,
              duration: l.duration || "15 min",
              completed: Boolean(l.completed),
              script: l.script || "",
              order: i + 1,
              xpReward: 100,
            },
          },
          { upsert: true }
        );
      }
    }

    // Index lesson chunks for RAG grounding
    await indexCourseLessonChunks(courseDoc);
  }
  console.log(`✔ Seeded ${courseDocs.length} Courses with Lessons, Modules & RAG Chunks.`);

  // 4. Seed Quizzes
  console.log("\n[4/7] Seeding Quizzes...");
  for (const q of seedQuizzes) {
    await Quiz.findOneAndUpdate(
      { leagueId: q.leagueId, partId: q.partId },
      { $set: q },
      { upsert: true, new: true }
    );
  }
  console.log(`✔ Seeded ${seedQuizzes.length} Quizzes.`);

  // 5. Seed Certificates
  console.log("\n[5/7] Seeding Certificates...");
  const student = userDocs.find((u) => u.email === "shailesh@uptoskills.com") || userDocs[0];
  for (const cert of seedCertificates) {
    await Certificate.findOneAndUpdate(
      { verificationCode: cert.verificationCode },
      {
        $set: {
          ...cert,
          userId: student ? student._id : 1,
        },
      },
      { upsert: true, new: true }
    );
  }
  console.log(`✔ Seeded ${seedCertificates.length} Certificates.`);

  // 6. Seed Forum Posts & Comments
  console.log("\n[6/7] Seeding Community Forum Discussions...");
  for (const p of seedForumPosts) {
    const post = await ForumPost.findOneAndUpdate(
      { title: p.title },
      {
        $set: {
          ...p,
          authorId: student ? student._id : 1,
        },
      },
      { upsert: true, new: true }
    );

    if (Array.isArray(p.comments)) {
      for (const comment of p.comments) {
        await ForumComment.findOneAndUpdate(
          { postId: post._id, content: comment.content },
          {
            $set: {
              postId: post._id,
              author: comment.author,
              content: comment.content,
              timestamp: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }
  }
  console.log(`✔ Seeded ${seedForumPosts.length} Forum Discussions with Comments.`);

  // 7. Seed Daily Challenges & Student Enrollments
  console.log("\n[7/7] Seeding Daily Challenges & Enrollments...");
  for (const dc of demoChallenges) {
    await DailyChallenge.findOneAndUpdate(
      { id: dc.id },
      { $set: dc },
      { upsert: true, new: true }
    );
  }

  if (student && courseDocs.length >= 2) {
    await Enrollment.findOneAndUpdate(
      { userId: student._id, courseId: courseDocs[0]._id },
      {
        $set: {
          userId: student._id,
          courseId: courseDocs[0]._id,
          enrolledAt: new Date(),
          progress: 50,
          completed: false,
        },
      },
      { upsert: true }
    );
    await Enrollment.findOneAndUpdate(
      { userId: student._id, courseId: courseDocs[1]._id },
      {
        $set: {
          userId: student._id,
          courseId: courseDocs[1]._id,
          enrolledAt: new Date(),
          progress: 25,
          completed: false,
        },
      },
      { upsert: true }
    );
  }
  console.log("✔ Seeded Daily Challenges & Student Enrollments.");

  console.log("\n==================================================");
  console.log("🎉 Database Seed Completed Successfully!");
  console.log("==================================================");
  console.table(
    userDocs.map((u) => ({
      Role: u.role,
      Email: u.email,
      XP: u.xp,
      Status: u.status,
    }))
  );
};

// Auto-run if executed directly as a script
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seedDatabase()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("[Seed Error]", err.message);
      await disconnectDB();
      process.exit(1);
    });
}
