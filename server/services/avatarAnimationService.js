/**
 * Avatar Animation & Lip-Sync Service
 *
 * Implements audio-to-viseme mapping and facial animation frames
 * compatible with Web Speech API audio events and video avatar engines
 * (e.g. SadTalker, Wav2Lip, D-ID, and HeyGen).
 */

export const generateVisemeTimeline = (text, durationMs) => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const timePerWord = durationMs / words.length;
  const timeline = [];

  words.forEach((word, index) => {
    const startTime = index * timePerWord;
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");

    // Approximate visemes: mouth shapes (A, E, O, U, Rest)
    let mouthShape = "A";
    if (cleanWord.includes("o") || cleanWord.includes("u")) mouthShape = "O";
    else if (cleanWord.includes("e") || cleanWord.includes("i")) mouthShape = "E";
    else if (cleanWord.match(/^[bmp]/)) mouthShape = "M";

    timeline.push({
      word,
      startTime: Math.round(startTime),
      endTime: Math.round(startTime + timePerWord),
      viseme: mouthShape,
      intensity: 0.7 + Math.random() * 0.3,
    });
  });

  return timeline;
};

export const getAvatarStreamingConfig = (mentorId) => {
  return {
    fps: 30,
    aspectRatio: "16:9",
    lipSyncModel: "Wav2Lip-HQ",
    supportedEngines: ["Browser Canvas WebAudio Sync", "HeyGen WebRTC", "D-ID Talk Streams"],
    expressions: {
      idle: "neutral_attentive",
      speaking: "expressive_gesturing",
      thinking: "slight_head_tilt",
      encouraging: "warm_smile",
    },
    canvasConfig: {
      waveformBars: 32,
      pulseGlowColor: "#2563EB",
      reactionFrequency: 60, // ms
    },
  };
};

export default {
  generateVisemeTimeline,
  getAvatarStreamingConfig,
};
