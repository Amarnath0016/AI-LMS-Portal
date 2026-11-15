import {
  chatWithMentor,
  generateStructuredLesson,
  publishLessonDraft,
  evaluateCodeSnippet,
} from "../services/aiMentorService.js";
import {
  generateLessonAudio,
  getCelebrityVoiceConfig,
  synthesizeSpeechElevenLabs,
} from "../services/voiceSynthesisService.js";
import {
  getMentorAvatarConfig,
  computePhoneticVisemes,
} from "../services/avatarAnimationService.js";
import LessonDraft from "../models/LessonDraft.js";
import Mentor from "../models/Mentor.js";
import mongoose from "mongoose";

export const handleLessonAudioGeneration = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { mentorId } = req.body || {};

    if (!lessonId) {
      return res.status(400).json({ success: false, message: "Lesson ID is required." });
    }

    const audioData = await generateLessonAudio({
      lessonId,
      mentorId,
    });

    return res.json({
      success: true,
      data: audioData,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleMentorChat = async (req, res) => {
  try {
    const { mentorId = 1, message, courseId, history } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question for the mentor.",
      });
    }

    const aiResponse = await chatWithMentor({
      userId,
      mentorId,
      courseId,
      message,
      history,
    });

    const voiceConfig = getCelebrityVoiceConfig(Number(mentorId));
    const visemes = computePhoneticVisemes({ text: aiResponse.reply });

    return res.json({
      success: true,
      data: {
        ...aiResponse,
        voiceConfig,
        visemes,
      },
    });
  } catch (error) {
    if (error.status === 429) {
      return res.status(429).json({ success: false, message: error.message });
    }
    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message: error.message,
        retryable: true,
      });
    }
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleLectureGeneration = async (req, res) => {
  try {
    const { mentorId = 1, topic, level = "Beginner", courseId } = req.body;
    const instructorId = req.user?._id || req.user?.id;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "Lesson topic is required for structured generation.",
      });
    }

    const draft = await generateStructuredLesson({
      instructorId,
      courseId,
      mentorId,
      topic,
      level,
    });

    return res.status(201).json({
      success: true,
      message:
        "Structured lesson generated and saved as draft for human review. Never auto-published.",
      data: draft,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetLessonDrafts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const drafts = await LessonDraft.find({ courseId }).sort({ createdAt: -1 });
    return res.json({ success: true, count: drafts.length, data: drafts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handlePublishLessonDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const reviewerId = req.user?._id || req.user?.id;

    const result = await publishLessonDraft({ draftId, reviewerId });
    return res.json({
      success: true,
      message: "Lesson draft successfully published to course curriculum.",
      data: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleCodeEvaluation = async (req, res) => {
  try {
    const { code, language = "javascript", problemTitle } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Code content is required." });
    }

    const evaluation = await evaluateCodeSnippet({ code, language, problemTitle });
    return res.json({ success: true, data: evaluation });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetVoiceProfile = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const isOid =
      mentorId &&
      mongoose.Types.ObjectId.isValid(mentorId) &&
      String(new mongoose.Types.ObjectId(mentorId)) === String(mentorId);
    const mentor =
      (await Mentor.findOne(isOid ? { _id: mentorId } : { id: isNaN(mentorId) ? mentorId : Number(mentorId) })) ||
      (await Mentor.findOne({ id: 1 })) ||
      (await Mentor.findOne());

    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found." });
    }

    const voiceSettings = mentor.voiceSettings || {};
    return res.json({
      success: true,
      data: {
        mentorId: mentor._id || mentor.id,
        mentorName: mentor.name,
        pitch: voiceSettings.pitch ?? 1.0,
        rate: voiceSettings.rate ?? 1.0,
        voiceName: voiceSettings.voiceName || "en-US-Neural2-D",
        elevenVoiceId: voiceSettings.elevenVoiceId || "",
        tone: voiceSettings.tone || "measured",
        provider: voiceSettings.provider || "google-tts",
        isLicensedClone: Boolean(voiceSettings.isLicensedClone),
        consentNotice: voiceSettings.consentNotice || "Authorized pedagogical voice profile.",
        voiceKeyword: voiceSettings.voiceKeyword || "Google US English",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetAvatarConfig = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const config = await getMentorAvatarConfig(mentorId);
    return res.json({ success: true, data: config });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleSynthesizeAudio = async (req, res) => {
  try {
    const { text, mentorId } = req.body;
    const voiceConfig = getCelebrityVoiceConfig(Number(mentorId));
    const result = await synthesizeSpeechElevenLabs({
      text,
      voiceId: voiceConfig.elevenVoiceId,
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
