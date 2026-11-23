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
  SubscriptionPlan,
} from "../models/index.js";
import { indexCourseLessonChunks } from "../utils/retrievalUtils.js";
import {
  seedMentors,
  seedCourses,
  seedUsers,
  seedQuizzes,
  seedCertificates,
  seedForumPosts,
  seedSubscriptionPlans,
} from "../utils/seedData.js";

export const demoChallenges = [
  {
    id: "dc-2026-07-19",
    title: "Build a Debounce Function with Immediate Execution Option",
    difficulty: "Medium",
    category: "JavaScript / Frontend Engineering",
    xpReward: 200,
    streakBonus: 50,
    functionName: "debounce",
    date: "2026-07-19",
    description: `Implement a \`debounce\` function that delays processing expensive tasks until after a specified \`wait\` time has elapsed since the last time the function was invoked.

### Requirements:
1. Return a function that delays execution of \`func\` by \`wait\` milliseconds.
2. If \`immediate\` option is \`true\`, trigger the function on the leading edge instead of trailing.
3. Preserve the function context (\`this\`) and pass all arguments correctly.
4. Support rapid calls without executing multiple times.`,
    starterCode: `/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} [immediate=false]
 * @returns {Function}
 */
function debounce(func, wait, immediate = false) {
  let timeout = null;

  return function (...args) {
    const context = this;
    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) {
      func.apply(context, args);
    }
  };
}`,
    testCases: [
      {
        name: "Test 1: Returns a debounced function wrapper",
        testCode: "const fn = () => {}; const d = debounce(fn, 100); return typeof d === 'function';",
        expected: true,
      },
      {
        name: "Test 2: Delays execution until wait time passes",
        testCode: "let called = false; const d = debounce(() => { called = true; }, 30); d(); return new Promise(resolve => setTimeout(() => resolve(called), 60));",
        expected: true,
      },
      {
        name: "Test 3: Leading edge execution when immediate = true",
        testCode: "let count = 0; const d = debounce(() => { count++; }, 50, true); d(); return count === 1;",
        expected: true,
      },
    ],
    hiddenTestCases: [
      {
        name: "Hidden Test 1: Rapid calls execute only once on trailing edge",
        testCode: "let count = 0; const d = debounce(() => { count++; }, 40); d(); d(); d(); return new Promise(resolve => setTimeout(() => resolve(count === 1), 90));",
        expected: true,
      },
      {
        name: "Hidden Test 2: Passes correct arguments and preserves context",
        testCode: "let sum = 0; const d = debounce((a, b) => { sum = a + b; }, 30); d(10, 20); return new Promise(resolve => setTimeout(() => resolve(sum === 30), 60));",
        expected: true,
      },
    ],
    hints: [
      { hint: "Use `clearTimeout` to cancel existing pending timers before setting a new one.", cost: 10 },
      { hint: "Store the `timeout` variable in the outer closure so it persists across calls.", cost: 10 },
      { hint: "For immediate execution, check if `timeout` is null when called, and only invoke `func` if true.", cost: 10 },
    ],
    participants: 1420,
    active: true,
  },
  {
    id: "dc-2026-07-18",
    title: "Flatten Nested Array with Depth Control",
    difficulty: "Easy",
    category: "Algorithms",
    xpReward: 150,
    streakBonus: 50,
    functionName: "flatten",
    date: "2026-07-18",
    description: `Write a function \`flatten(arr, depth)\` that flattens an array of nested arrays up to the specified \`depth\`. Default depth should be 1.`,
    starterCode: `function flatten(arr, depth = 1) {\n  // Write your solution here\n}`,
    testCases: [
      {
        name: "Test 1: Flattens 1 level depth",
        input: [[1, [2, 3], [4, [5]]], 1],
        expected: [1, 2, 3, 4, [5]],
      },
      {
        name: "Test 2: Flattens 2 levels depth",
        input: [[1, [2, [3, [4]], 5]], 2],
        expected: [1, 2, 3, 4, 5],
      },
    ],
    hiddenTestCases: [
      {
        name: "Hidden Test 1: Depth 0 returns identical array",
        input: [[1, [2, 3]], 0],
        expected: [1, [2, 3]],
      },
      {
        name: "Hidden Test 2: Arbitrary high depth flattens completely",
        input: [[[[[[1]]], 2]], 10],
        expected: [1, 2],
      },
    ],
    hints: [
      { hint: "Consider recursion or Array.prototype.reduce.", cost: 10 },
    ],
    participants: 980,
    active: true,
  },
  {
    id: "dc-2026-07-17",
    title: "Two Sum Target Index Pair",
    difficulty: "Easy",
    category: "Algorithms",
    xpReward: 150,
    streakBonus: 50,
    functionName: "twoSum",
    date: "2026-07-17",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.`,
    starterCode: `function twoSum(nums, target) {\n  // Write your solution here\n}`,
    testCases: [
      {
        name: "Test 1: Basic indices",
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
      },
      {
        name: "Test 2: Target 6 in array",
        input: [[3, 2, 4], 6],
        expected: [1, 2],
      },
    ],
    hiddenTestCases: [
      {
        name: "Hidden Test 1: Duplicated values",
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
      { hint: "Use a Map or hash object to store complement values in a single pass.", cost: 10 },
    ],
    participants: 2150,
    active: true,
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

  // 2.5 Seed Subscription Plans
  console.log("\n[2.5/7] Seeding Subscription Plans...");
  const planDocs = [];
  for (const sp of seedSubscriptionPlans) {
    const planDoc = await SubscriptionPlan.findOneAndUpdate(
      { name: sp.name },
      { $set: sp },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    planDocs.push(planDoc);
    console.log(`✔ Seeded subscription plan: ${planDoc.name} (₹${planDoc.price})`);
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
  console.log("\n🔑 Test Accounts & Known Credentials:");
  console.log("  • Student:    shailesh@uptoskills.com     | password: student123");
  console.log("  • Instructor: priya.mentor@uptoskills.com | password: mentor123");
  console.log("  • Admin:      admin@uptoskills.com        | password: admin123 (Admin Code: 123456)");
  console.log("==================================================\n");
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
