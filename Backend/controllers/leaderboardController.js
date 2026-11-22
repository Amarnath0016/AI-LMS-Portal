import User from "../models/User.js";

const getLearnerTitle = (xp) => {
  if (xp >= 50000) return "AI Visionary";
  if (xp >= 25000) return "Master of First-Principles";
  if (xp >= 15000) return "UptoSkills Scholar";
  if (xp >= 10000) return "Algorithms Specialist";
  if (xp >= 5000) return "League Champion";
  return "Rising Learner";
};

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ status: "Active" })
      .select("name email xp streak avatar role lastActiveAt")
      .sort({ xp: -1 })
      .limit(50);

    const mapped = users.map((u, index) => ({
      rank: index + 1,
      id: u._id,
      name: u.name,
      email: u.email,
      xp: u.xp || 0,
      streak: u.streak || 1,
      initials: u.avatar || u.name.slice(0, 2).toUpperCase(),
      title: getLearnerTitle(u.xp || 0),
      role: u.role,
      lastActiveAt: u.lastActiveAt,
    }));

    return res.json({
      success: true,
      count: mapped.length,
      data: mapped,
      weekly: mapped.slice(0, 15),
      allTime: mapped,
      totalLearners: mapped.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
