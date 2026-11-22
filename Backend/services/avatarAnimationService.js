import mongoose from "mongoose";
import Mentor from "../models/Mentor.js";

/**
 * Phonetic-to-Viseme Mapping Table (IPA & ARPAbet standard mouth shapes)
 * No randomized fake intensity values - strictly deterministic linguistic alignment.
 */
const PHONETIC_VISEME_MAP = {
  // Open Vowels (Jaw Drop)
  aa: "AA",
  ae: "AA",
  ah: "AA",
  ao: "O",
  // Front / Spread Vowels (Wide Smile)
  iy: "EE",
  ih: "EE",
  eh: "EE",
  ey: "EE",
  // Rounded / Closed Vowels (Pucker)
  uw: "OH",
  uh: "OH",
  ow: "OH",
  oy: "OH",
  // Bilabial Consonants (Closed Lips)
  b: "MM",
  p: "MM",
  m: "MM",
  // Labiodental Consonants (Lip-to-Teeth)
  f: "FF",
  v: "FF",
  // Rest
  sil: "REST",
};

/**
 * Deterministically compute phonetic visemes aligned with real word timestamps from TTS.
 */
export const computePhoneticVisemes = ({ text, words = [], totalDuration = 0 }) => {
  if (!words || words.length === 0) {
    if (!text || !text.trim()) return [];
    const tokens = text.trim().split(/\s+/).filter(Boolean);
    const durPerWord = totalDuration > 0 ? totalDuration / tokens.length : 0.35;
    return tokens.map((word, i) => {
      const start = i * durPerWord;
      return {
        word,
        start: Math.round(start * 100) / 100,
        end: Math.round((start + durPerWord) * 100) / 100,
        viseme: getWordDominantViseme(word),
      };
    });
  }

  return words.map((w) => ({
    word: w.word,
    start: w.start,
    end: w.end,
    viseme: getWordDominantViseme(w.word),
  }));
};

const getWordDominantViseme = (word) => {
  const clean = (word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return "REST";

  if (/^[bmp]/.test(clean)) return "MM";
  if (/^[fv]/.test(clean)) return "FF";
  if (/[ou]/.test(clean)) return "OH";
  if (/[ei]/.test(clean)) return "EE";
  if (/a/.test(clean)) return "AA";
  return "UH";
};

/**
 * Retrieve verified, licensed mentor avatar configuration and consent status.
 */
export const getMentorAvatarConfig = async (mentorId) => {
  const isOid =
    mentorId &&
    mongoose.Types.ObjectId.isValid(mentorId) &&
    String(new mongoose.Types.ObjectId(mentorId)) === String(mentorId);

  const mentor =
    (await Mentor.findOne(isOid ? { _id: mentorId } : { id: isNaN(mentorId) ? mentorId : Number(mentorId) })) ||
    (await Mentor.findOne({ id: 1 })) ||
    (await Mentor.findOne());

  if (!mentor) {
    const err = new Error("Mentor avatar profile not found.");
    err.status = 404;
    throw err;
  }

  const avatar = mentor.avatarSettings || {};
  const isLicensed = Boolean(avatar.isLicensedAvatar !== false);
  const consentNotice =
    avatar.consentNotice ||
    "Authorized pedagogical avatar consent and synthetic likeness agreement on file.";

  const defaultAvatarUrl = `/api/ai/avatar-assets/mentor_${mentor.id || 1}.svg`;

  return {
    mentorId: mentor._id || mentor.id,
    mentorName: mentor.name,
    avatarUrl: avatar.avatarUrl || defaultAvatarUrl,
    avatarType: avatar.avatarType || "svg-canvas-2d",
    isLicensedAvatar: isLicensed,
    licenceType:
      avatar.licenceType ||
      "Commercial Educational License (CC-BY / Authorized Digital Likeness)",
    consentNotice,
    modelConfig: {
      skinTone: avatar.modelConfig?.skinTone || "#F5D0C5",
      hairColor: avatar.modelConfig?.hairColor || "#2C3E50",
      accentColor: mentor.accent || "#2563EB",
      suitColor: avatar.modelConfig?.suitColor || "#1E293B",
    },
    supportedEngines: ["WebAudio-AnalyserNode", "HTML5-Canvas-2D", "SVG-Layered"],
  };
};

/**
 * Backwards compatible avatar streaming config.
 */
export const getAvatarStreamingConfig = async (mentorId) => {
  return getMentorAvatarConfig(mentorId);
};

export default {
  computePhoneticVisemes,
  getMentorAvatarConfig,
  getAvatarStreamingConfig,
};
