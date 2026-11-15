import DailyChallenge from "../models/DailyChallenge.js";
import ChallengeSubmission from "../models/ChallengeSubmission.js";
import User from "../models/User.js";
import { runChallengeSandbox } from "../services/sandboxRunner.js";

const getUtcDateString = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCalendarDayDifference = (today, pastDate) => {
  if (!pastDate) return Infinity;
  const d1 = new Date(getUtcDateString(today));
  const d2 = new Date(getUtcDateString(pastDate));
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 1. Get Today's Active Challenge
 * Strips hidden test cases so they cannot be inspected by the client.
 * Hides locked hint text until unlocked server-side.
 */
export const getTodayChallenge = async (req, res) => {
  try {
    const todayStr = getUtcDateString();

    let challenge = await DailyChallenge.findOne({ active: true, date: todayStr });
    if (!challenge) {
      // Fallback to latest active challenge
      challenge = await DailyChallenge.findOne({ active: true }).sort({ date: -1, createdAt: -1 });
    }

    if (!challenge) {
      return res.status(404).json({ success: false, message: "No active challenge available today." });
    }

    // Check user hints and completion if authenticated
    let unlockedHintIndices = new Set();
    let completedToday = false;
    let userSubmission = null;

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user?.unlockedHints) {
        user.unlockedHints
          .filter((h) => h.challengeId === challenge.id)
          .forEach((h) => unlockedHintIndices.add(h.hintIndex));
      }

      userSubmission = await ChallengeSubmission.findOne({
        challengeId: challenge.id,
        userId: req.user._id,
        passed: true,
      }).sort({ submittedAt: -1 });

      if (userSubmission && userSubmission.submissionDate === todayStr) {
        completedToday = true;
      }
    }

    // Sanitize hints: reveal only unlocked hints
    const sanitizedHints = (challenge.hints || []).map((h, idx) => {
      const isUnlocked = unlockedHintIndices.has(idx);
      return {
        id: h._id,
        index: idx,
        hint: isUnlocked ? h.hint : null,
        cost: h.cost || 10,
        unlocked: isUnlocked,
      };
    });

    // Strip hiddenTestCases before sending to client
    const challengeData = {
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      category: challenge.category,
      xpReward: challenge.xpReward,
      streakBonus: challenge.streakBonus,
      description: challenge.description,
      starterCode: challenge.starterCode,
      functionName: challenge.functionName,
      testCases: challenge.testCases || [],
      hints: sanitizedHints,
      participants: challenge.participants || 0,
      date: challenge.date,
      completedToday,
      userStreak: req.user?.streak || 1,
      userXp: req.user?.xp || 0,
    };

    return res.json({ success: true, data: challengeData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get Challenge by ID
 */
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await DailyChallenge.findOne({ id });

    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found." });
    }

    let unlockedHintIndices = new Set();
    let completedToday = false;
    const todayStr = getUtcDateString();

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user?.unlockedHints) {
        user.unlockedHints
          .filter((h) => h.challengeId === challenge.id)
          .forEach((h) => unlockedHintIndices.add(h.hintIndex));
      }

      const userSubmission = await ChallengeSubmission.findOne({
        challengeId: challenge.id,
        userId: req.user._id,
        passed: true,
      }).sort({ submittedAt: -1 });

      if (userSubmission && userSubmission.submissionDate === todayStr) {
        completedToday = true;
      }
    }

    const sanitizedHints = (challenge.hints || []).map((h, idx) => {
      const isUnlocked = unlockedHintIndices.has(idx);
      return {
        id: h._id,
        index: idx,
        hint: isUnlocked ? h.hint : null,
        cost: h.cost || 10,
        unlocked: isUnlocked,
      };
    });

    const challengeData = {
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      category: challenge.category,
      xpReward: challenge.xpReward,
      streakBonus: challenge.streakBonus,
      description: challenge.description,
      starterCode: challenge.starterCode,
      functionName: challenge.functionName,
      testCases: challenge.testCases || [],
      hints: sanitizedHints,
      participants: challenge.participants || 0,
      date: challenge.date,
      completedToday,
      userStreak: req.user?.streak || 1,
      userXp: req.user?.xp || 0,
    };

    return res.json({ success: true, data: challengeData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. List All Challenges (Past Archive)
 */
export const getAllChallenges = async (req, res) => {
  try {
    const challenges = await DailyChallenge.find({ active: true }).sort({ date: -1, createdAt: -1 });

    let completedChallengeIds = new Set();
    if (req.user) {
      const submissions = await ChallengeSubmission.find({
        userId: req.user._id,
        passed: true,
      });
      submissions.forEach((s) => completedChallengeIds.add(s.challengeId));
    }

    const data = challenges.map((ch) => ({
      id: ch.id,
      title: ch.title,
      difficulty: ch.difficulty,
      category: ch.category,
      xp: ch.xpReward,
      date: ch.date || "Archive",
      status: completedChallengeIds.has(ch.id) ? "Completed" : "Available",
      participants: ch.participants || 0,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Run Code Against Visible Test Cases in Sandbox (Advisory / Run Tests)
 * Does NOT award XP or update streaks.
 */
export const runChallengeCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ success: false, message: "Code is required for execution." });
    }

    const challenge = await DailyChallenge.findOne({ id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found." });
    }

    // Execute only visible test cases in isolated sandbox
    const visibleCases = (challenge.testCases || []).map((tc) => ({
      name: tc.name,
      input: tc.input,
      expected: tc.expected,
      testCode: tc.testCode,
      hidden: false,
    }));

    const sandboxResult = await runChallengeSandbox({
      code,
      functionName: challenge.functionName || "solution",
      testCases: visibleCases,
      timeoutMs: 2000,
    });

    return res.json({
      success: true,
      passed: sandboxResult.passed,
      results: sandboxResult.results || [],
      error: sandboxResult.error || null,
      logs: sandboxResult.logs || [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Submit Code (Real Evaluation on Visible + Hidden Test Cases)
 * Awards XP and updates streaks server-side ONCE per challenge per day.
 * AI feedback is never used to decide pass/fail.
 */
export const submitChallengeCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language = "javascript" } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ success: false, message: "Code is required for submission." });
    }

    const challenge = await DailyChallenge.findOne({ id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found." });
    }

    // Combine visible test cases and hidden test cases
    const visibleCases = (challenge.testCases || []).map((tc) => ({
      name: tc.name || "Visible Test Case",
      input: tc.input,
      expected: tc.expected,
      testCode: tc.testCode,
      hidden: false,
    }));

    const hiddenCases = (challenge.hiddenTestCases || []).map((tc, idx) => ({
      name: tc.name || `Hidden Test Case #${idx + 1}`,
      input: tc.input,
      expected: tc.expected,
      testCode: tc.testCode,
      hidden: true,
    }));

    const allTestCases = [...visibleCases, ...hiddenCases];

    // Execute in sandbox runner
    const sandboxResult = await runChallengeSandbox({
      code,
      functionName: challenge.functionName || "solution",
      testCases: allTestCases,
      timeoutMs: 2500,
    });

    const passed = Boolean(sandboxResult.passed);
    const todayStr = getUtcDateString();
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User account not found." });
    }

    // Format results: for hidden test cases, do not leak detailed expected/actual values
    const clientResults = (sandboxResult.results || []).map((r) => {
      if (r.hidden) {
        return {
          name: r.name,
          passed: r.passed,
          executionTimeMs: r.executionTimeMs,
          error: r.error ? (r.passed ? null : "Failed hidden assertion.") : null,
          hidden: true,
        };
      }
      return r;
    });

    if (!passed) {
      // Record failed attempt
      await ChallengeSubmission.create({
        challengeId: challenge.id,
        userId: user._id,
        code,
        language,
        passed: false,
        xpEarned: 0,
        streakBonusEarned: 0,
        results: sandboxResult.results || [],
        submissionDate: todayStr,
      });

      return res.json({
        success: true,
        passed: false,
        xpEarned: 0,
        message: sandboxResult.error || "One or more test cases failed.",
        results: clientResults,
      });
    }

    // Check if user already completed this challenge today
    const existingTodayPass = await ChallengeSubmission.findOne({
      challengeId: challenge.id,
      userId: user._id,
      passed: true,
      submissionDate: todayStr,
    });

    if (existingTodayPass) {
      // Record submission but award 0 duplicate XP and no duplicate streak
      await ChallengeSubmission.create({
        challengeId: challenge.id,
        userId: user._id,
        code,
        language,
        passed: true,
        xpEarned: 0,
        streakBonusEarned: 0,
        results: sandboxResult.results || [],
        submissionDate: todayStr,
      });

      return res.json({
        success: true,
        passed: true,
        alreadyCompletedToday: true,
        xpEarned: 0,
        streakBonusEarned: 0,
        streak: user.streak,
        userXp: user.xp,
        message: "Challenge already completed today! No additional XP awarded.",
        results: clientResults,
      });
    }

    // Calculate XP and Streak server-side
    const baseReward = challenge.xpReward || 200;
    let streakBonusEarned = 0;

    const dayDiff = getCalendarDayDifference(new Date(), user.lastChallengeDate);
    if (dayDiff === 1) {
      // Completed yesterday: increment streak and award bonus
      user.streak = (user.streak || 0) + 1;
      streakBonusEarned = challenge.streakBonus || 50;
    } else if (dayDiff === 0) {
      // Already completed another challenge today: keep streak
      streakBonusEarned = 0;
    } else {
      // Missed one or more days: reset streak to 1
      user.streak = 1;
      streakBonusEarned = 0;
    }

    const totalXpEarned = baseReward + streakBonusEarned;
    user.xp = (user.xp || 0) + totalXpEarned;
    user.lastChallengeDate = new Date();
    user.lastActiveAt = new Date();
    await user.save();

    // Record passing submission
    await ChallengeSubmission.create({
      challengeId: challenge.id,
      userId: user._id,
      code,
      language,
      passed: true,
      xpEarned: totalXpEarned,
      streakBonusEarned,
      results: sandboxResult.results || [],
      submissionDate: todayStr,
    });

    // Increment participants
    await DailyChallenge.updateOne({ id: challenge.id }, { $inc: { participants: 1 } });

    return res.json({
      success: true,
      passed: true,
      xpEarned: totalXpEarned,
      streakBonusEarned,
      streak: user.streak,
      userXp: user.xp,
      message: `🎉 Challenge Solved! You earned +${totalXpEarned} XP!`,
      results: clientResults,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Unlock Challenge Hint (Server-side XP Deduction)
 */
export const unlockChallengeHint = async (req, res) => {
  try {
    const { id, hintIndex } = req.params;
    const index = parseInt(hintIndex, 10);

    const challenge = await DailyChallenge.findOne({ id });
    if (!challenge) {
      return res.status(404).json({ success: false, message: "Challenge not found." });
    }

    if (isNaN(index) || index < 0 || index >= (challenge.hints || []).length) {
      return res.status(400).json({ success: false, message: "Invalid hint index requested." });
    }

    const targetHint = challenge.hints[index];
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User account not found." });
    }

    if (!user.unlockedHints) {
      user.unlockedHints = [];
    }

    // Check if already unlocked
    const alreadyUnlocked = user.unlockedHints.some(
      (h) => h.challengeId === challenge.id && h.hintIndex === index
    );

    if (alreadyUnlocked) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        hint: targetHint.hint,
        cost: 0,
        currentXp: user.xp,
        message: "Hint was already unlocked.",
      });
    }

    // Deduct cost server-side
    const cost = targetHint.cost || 10;
    user.xp = Math.max(0, (user.xp || 0) - cost);
    user.unlockedHints.push({
      challengeId: challenge.id,
      hintIndex: index,
      unlockedAt: new Date(),
    });

    await user.save();

    return res.json({
      success: true,
      unlocked: true,
      hint: targetHint.hint,
      cost,
      currentXp: user.xp,
      message: `Hint unlocked! -${cost} XP deducted.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
