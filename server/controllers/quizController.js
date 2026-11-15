import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { computeUpdatedStreak } from "../utils/streakUtils.js";
import { issueCertificateIfEligible } from "../utils/certificateUtils.js";

const getUserQuery = (id) => {
  if (!id) return { _id: null };
  if (id._id) return { _id: id._id };
  if (id instanceof mongoose.Types.ObjectId) return { _id: id };
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getLeagues = async (req, res) => {
  const leagues = [
    { id: 101, title: "Python Sprint League", category: "Programming", level: "Beginner", quizzes: 12, xp: 1200, players: "18K", description: "Solve Python basics, loops, functions, and debugging challenges." },
    { id: 102, title: "JavaScript DOM League", category: "Programming", level: "Beginner", quizzes: 10, xp: 1100, players: "16K", description: "Practice browser APIs, events, arrays, and async JavaScript." },
    { id: 103, title: "React Battle League", category: "Web Development", level: "Intermediate", quizzes: 14, xp: 1800, players: "21K", description: "Test hooks, component patterns, state management, and UI architecture." },
    { id: 104, title: "Node API League", category: "Web Development", level: "Intermediate", quizzes: 13, xp: 1700, players: "12K", description: "Solve REST API, authentication, middleware, and database questions." },
    { id: 105, title: "DSA Arena League", category: "Programming", level: "Advanced", quizzes: 18, xp: 2600, players: "28K", description: "Compete on arrays, graphs, recursion, DP, and complexity problems." },
    { id: 106, title: "Machine Learning League", category: "AI/ML", level: "Advanced", quizzes: 16, xp: 2400, players: "19K", description: "Challenge yourself on models, metrics, neural networks, and ML workflows." },
    { id: 107, title: "Cyber Defense League", category: "Cybersecurity", level: "Beginner", quizzes: 11, xp: 1300, players: "9K", description: "Answer security fundamentals, phishing, passwords, and web risk quizzes." },
    { id: 108, title: "Cloud Architect League", category: "Cloud", level: "Intermediate", quizzes: 15, xp: 2100, players: "14K", description: "Practice compute, storage, networking, scaling, and deployment concepts." },
    { id: 109, title: "DevOps Reliability League", category: "DevOps", level: "Advanced", quizzes: 15, xp: 2300, players: "10K", description: "Test CI/CD, containers, observability, rollback, and release strategy." },
    { id: 110, title: "Product Thinking League", category: "Product", level: "Beginner", quizzes: 9, xp: 1000, players: "8K", description: "Practice prioritization, user empathy, metrics, and roadmap scenarios." },
  ];
  return res.json({ success: true, count: leagues.length, data: leagues });
};

export const getMyQuizAttempts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const attempts = await QuizAttempt.find({ userId }).sort({ attemptedAt: -1 });
    return res.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { leagueId, partId } = req.params;
    const quiz = await Quiz.findOne({
      leagueId: Number(leagueId),
      partId: Number(partId),
    });

    if (!quiz) {
      // Fallback dynamic quiz for any league, WITHOUT correct answer
      return res.json({
        success: true,
        data: {
          id: `${leagueId}-${partId}`,
          leagueId: Number(leagueId),
          partId: Number(partId),
          title: `League #${leagueId} Mastery Check`,
          questions: [
            {
              id: 1,
              question: "What is the primary benefit of First-Principles reasoning in engineering?",
              options: [
                "It avoids reasoning by flawed analogy and uncovers core physics constraints",
                "It makes code run 10x faster automatically",
                "It replaces compiler optimizations",
                "It eliminates the need for software testing",
              ],
            },
            {
              id: 2,
              question: "In distributed computing, what is the CAP theorem constraint?",
              options: [
                "You can only guarantee two out of Consistency, Availability, and Partition Tolerance",
                "Compute, Access, and Persistence must scale together",
                "CPU, Acceleration, and Pipeline must be synchronized",
                "Clusters Always Partition",
              ],
            },
          ],
        },
      });
    }

    // Requirement: GET quiz must NOT return correct answers!
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return res.json({
      success: true,
      data: {
        _id: quiz._id,
        id: quiz.id || quiz._id,
        leagueId: quiz.leagueId,
        partId: quiz.partId,
        title: quiz.title,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const quizIdParam = req.params.id;
    const { leagueId, partId, answers = {}, xpAward = 150 } = req.body;
    const userId = req.user?._id || req.user?.id || 1;

    let targetLeagueId = leagueId;
    let targetPartId = partId;

    if (quizIdParam && quizIdParam.includes("-")) {
      const parts = quizIdParam.split("-");
      targetLeagueId = Number(parts[0]);
      targetPartId = Number(parts[1]);
    }

    // Fetch quiz with real answers for server grading
    let quiz = null;
    if (mongoose.Types.ObjectId.isValid(quizIdParam)) {
      quiz = await Quiz.findById(quizIdParam);
    }
    if (!quiz && targetLeagueId !== undefined && targetPartId !== undefined) {
      quiz = await Quiz.findOne({
        leagueId: Number(targetLeagueId),
        partId: Number(targetPartId),
      });
    }

    let score = 0;
    let maxQuestions = 2;
    const detailedResults = [];

    if (quiz && Array.isArray(quiz.questions)) {
      maxQuestions = quiz.questions.length;
      quiz.questions.forEach((q, idx) => {
        // Support answers map by question id: { 1: 0 } or array index: [0, 2]
        const userAnswer =
          answers[q.id] !== undefined
            ? Number(answers[q.id])
            : answers[idx] !== undefined
            ? Number(answers[idx])
            : null;

        const isCorrect = userAnswer !== null && userAnswer === q.answer;
        if (isCorrect) score += 1;

        detailedResults.push({
          questionId: q.id,
          isCorrect,
          correctAnswer: q.answer,
          explanation: q.explanation || "",
        });
      });
    } else {
      // Dynamic fallback grading
      const defaultAnswers = { 1: 0, 2: 0 };
      maxQuestions = 2;
      [1, 2].forEach((qid) => {
        const uAns = answers[qid] !== undefined ? Number(answers[qid]) : null;
        const isCorrect = uAns === defaultAnswers[qid];
        if (isCorrect) score += 1;
        detailedResults.push({
          questionId: qid,
          isCorrect,
          correctAnswer: defaultAnswers[qid],
        });
      });
    }

    const passed = (score / maxQuestions) >= 0.7;
    const earnedXp = Math.round((score / maxQuestions) * xpAward);

    let user = req.user || (await User.findOne(getUserQuery(userId)));
    if (user) {
      user.xp = (user.xp || 0) + earnedXp;
      user.streak = computeUpdatedStreak(user.lastActiveAt, user.streak);
      user.lastActiveAt = new Date();
      await user.save();

      // Record Quiz Attempt
      try {
        await QuizAttempt.create({
          userId: user._id,
          quizId: quiz ? quiz._id : null,
          leagueId: Number(targetLeagueId || 1),
          partId: Number(targetPartId || 1),
          answers,
          score,
          maxQuestions,
          earnedXp,
          passed,
          attemptedAt: new Date(),
        });
      } catch (e) {
        console.warn("[Quiz] Failed to record quiz attempt:", e.message);
      }

      // Check if course certificate should be issued
      if (passed && targetLeagueId) {
        const matchingCourse = await Course.findOne({
          $or: [{ id: targetLeagueId }, { leagueId: targetLeagueId }],
        });
        if (matchingCourse) {
          await issueCertificateIfEligible(user._id, matchingCourse._id);
        }
      }
    }

    return res.json({
      success: true,
      message: `Quiz graded successfully! Score: ${score}/${maxQuestions}. +${earnedXp} XP awarded.`,
      score,
      maxQuestions,
      passed,
      earnedXp,
      results: detailedResults,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
