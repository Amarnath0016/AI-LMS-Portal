import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";

const getUserQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getQuiz = async (req, res) => {
  try {
    const { leagueId, partId } = req.params;
    const quiz = await Quiz.findOne({
      leagueId: Number(leagueId),
      partId: Number(partId),
    });

    if (!quiz) {
      // Fallback dynamic quiz for any league
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
              answer: 0,
              explanation: "First-principles thinking breaks problems down to fundamental truths to build innovative solutions from the ground up.",
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
              answer: 0,
              explanation: "The CAP theorem states that a distributed data store can simultaneously provide at most two of the three guarantees.",
            },
          ],
        },
      });
    }

    return res.json({ success: true, data: quiz });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { leagueId, partId, answers, score, maxQuestions, xpAward = 150 } = req.body;
    const userId = req.user?._id || req.user?.id || 1;

    let user = await User.findOne(getUserQuery(userId));

    let earnedXp = Math.round((Number(score) / Number(maxQuestions || 1)) * xpAward);
    if (user) {
      user.xp = (user.xp || 0) + earnedXp;
      await user.save();

      // Record Quiz Attempt with Mongoose
      try {
        await QuizAttempt.create({
          userId: user._id,
          leagueId: Number(leagueId),
          partId: Number(partId),
          answers,
          score: Number(score),
          maxQuestions: Number(maxQuestions),
          earnedXp,
          passed: (Number(score) / Number(maxQuestions || 1)) >= 0.7,
        });
      } catch (e) {
        // Log attempt creation failure if any
        console.warn("[Quiz] Failed to record quiz attempt:", e.message);
      }
    }

    return res.json({
      success: true,
      message: `Quiz submitted successfully! +${earnedXp} XP awarded.`,
      score,
      maxQuestions,
      earnedXp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
