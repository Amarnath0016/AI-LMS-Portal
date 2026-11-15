import mongoose from "mongoose";
import Mentor from "../models/Mentor.js";

const getMentorQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
    return { _id: id };
  }
  return { id: isNaN(id) ? id : Number(id) };
};

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().sort({ id: 1 });
    return res.json({ success: true, count: mentors.length, data: mentors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await Mentor.findOne(getMentorQuery(id));

    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found." });
    }

    return res.json({ success: true, data: mentor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
