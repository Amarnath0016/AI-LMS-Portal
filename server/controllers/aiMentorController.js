import {
  chatWithMentor,
  generateStructuredLesson,
  publishLessonDraft,
  evaluateCodeSnippet,
} from "../services/aiMentorService.js";
import {
  getCelebrityVoiceConfig,
  synthesizeSpeechElevenLabs,
} from "../services/voiceSynthesisService.js";
import {
  generateVisemeTimeline,
  getAvatarStreamingConfig,
} from "../services/avatarAnimationService.js";
import LessonDraft from "../models/LessonDraft.js";

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
    const visemes = generateVisemeTimeline(aiResponse.reply, 4000);

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
    const config = getCelebrityVoiceConfig(Number(mentorId));
    return res.json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetAvatarConfig = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const config = getAvatarStreamingConfig(Number(mentorId));
    return res.json({ success: true, data: config });
  } catch (error) {
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
