import {
  chatWithMentor,
  generateLectureScript,
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

export const handleMentorChat = async (req, res) => {
  try {
    const { mentorId = 1, message, courseContext, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a question for the mentor." });
    }

    const aiResponse = await chatWithMentor({
      mentorId: Number(mentorId),
      message,
      courseContext,
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
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const handleLectureGeneration = async (req, res) => {
  try {
    const { mentorId = 1, topic = "Python Programming", level = "Beginner" } = req.body;

    const lecture = await generateLectureScript({
      mentorId: Number(mentorId),
      topic,
      level,
    });

    return res.json({ success: true, data: lecture });
  } catch (error) {
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
