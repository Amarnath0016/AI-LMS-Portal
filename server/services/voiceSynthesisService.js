export const getCelebrityVoiceConfig = (mentorId) => {
  const configs = {
    // Elon Musk: lower pitch, slightly slower, measured pauses
    1: {
      pitch: 0.85,
      rate: 0.92,
      lang: "en-US",
      preferredVoices: ["Google US English", "Samantha", "Alex", "Daniel"],
      style: "visionary-thoughtful",
      ssmlRate: "-8%",
      ssmlPitch: "-15%",
      elevenVoiceId: "CYw3kZ02Hs0563khs1Fj",
    },
    // Sundar Pichai: warm, calm Indian-English cadence
    2: {
      pitch: 0.95,
      rate: 0.95,
      lang: "en-IN",
      preferredVoices: ["Google हिन्दी", "Rishi", "Veena", "Google UK English Male"],
      style: "measured-tech",
      ssmlRate: "-5%",
      ssmlPitch: "-5%",
      elevenVoiceId: "ErXwobaYiN019PkySvjV",
    },
    // Oprah Winfrey: warm, expressive, inspiring
    3: {
      pitch: 1.05,
      rate: 0.92,
      lang: "en-US",
      preferredVoices: ["Karen", "Victoria", "Google US English Female", "Moira"],
      style: "empathic-inspirational",
      ssmlRate: "-8%",
      ssmlPitch: "+5%",
      elevenVoiceId: "21m00Tcm4TlvDq8ikWAM",
    },
    // Jensen Huang: fast, energetic, crisp technical delivery
    4: {
      pitch: 0.92,
      rate: 1.05,
      lang: "en-US",
      preferredVoices: ["Alex", "Google US English", "Fred"],
      style: "intense-passionate",
      ssmlRate: "+5%",
      ssmlPitch: "-8%",
      elevenVoiceId: "TX3LPaxmHKxFdv7VOQHJ",
    },
    // Virat Kohli: energetic, motivational, high stamina
    5: {
      pitch: 1.0,
      rate: 1.05,
      lang: "en-IN",
      preferredVoices: ["Rishi", "Google UK English Male", "Google US English"],
      style: "energetic-motivational",
      ssmlRate: "+5%",
      ssmlPitch: "0%",
      elevenVoiceId: "yoZ06aMxZJJ28mfd3POQ",
    },
    // Shah Rukh Khan: charismatic, expressive, theatrical
    6: {
      pitch: 0.92,
      rate: 0.98,
      lang: "en-IN",
      preferredVoices: ["Rishi", "Daniel", "Google US English"],
      style: "charismatic-dramatic",
      ssmlRate: "-2%",
      ssmlPitch: "-8%",
      elevenVoiceId: "AZnzlk1XvdvUeBnXmlld",
    },
    // Satya Nadella: articulate, measured, executive
    7: {
      pitch: 0.98,
      rate: 0.95,
      lang: "en-IN",
      preferredVoices: ["Rishi", "Google UK English Male"],
      style: "growth-mindset",
      ssmlRate: "-5%",
      ssmlPitch: "-2%",
      elevenVoiceId: "EXAVITQu4vr4xnSDxMaL",
    },
    // Ada Lovelace: British, articulate, poetic
    8: {
      pitch: 1.1,
      rate: 0.95,
      lang: "en-GB",
      preferredVoices: ["Serena", "Google UK English Female", "Fiona"],
      style: "poetic-scientific",
      ssmlRate: "-5%",
      ssmlPitch: "+10%",
      elevenVoiceId: "MF3mGyEYCl7XYWbV9V6O",
    },
    // Mark Zuckerberg: direct, quick, product-focused
    9: {
      pitch: 0.96,
      rate: 1.05,
      lang: "en-US",
      preferredVoices: ["Samantha", "Alex", "Google US English"],
      style: "fast-iterative",
      ssmlRate: "+5%",
      ssmlPitch: "-4%",
      elevenVoiceId: "pNInz6obpgDQGcFmaJgB",
    },
    // Indra Nooyi: executive, commanding, warm
    10: {
      pitch: 1.0,
      rate: 0.98,
      lang: "en-IN",
      preferredVoices: ["Veena", "Google UK English Female"],
      style: "executive-clear",
      ssmlRate: "-2%",
      ssmlPitch: "0%",
      elevenVoiceId: "Th5MS25mJDxOGuTq7HR6",
    },
  };

  return configs[mentorId] || configs[1];
};

export const synthesizeSpeechElevenLabs = async ({ text, voiceId }) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      message: "ElevenLabs API Key not configured. Frontend will automatically use browser Web Speech API with tuned celebrity vocal characteristics.",
    };
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    return {
      success: true,
      audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getCelebrityVoiceConfig,
  synthesizeSpeechElevenLabs,
};
