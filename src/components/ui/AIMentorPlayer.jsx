import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Send,
  Loader2,
  BookOpen,
  HelpCircle,
  Gauge,
  Bot
} from "lucide-react";
import { Button } from "@/components/common/button";
import { aiApi } from "@/api/endpoints";
import { toast } from "sonner";

export function AIMentorPlayer({ mentor, lesson, onComplete }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState("transcript"); // transcript | askMentor | details
  
  // Mentor Live Doubts
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  // Web Speech Synthesis
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);

  const lessonScript =
    lesson?.script ||
    `Welcome to ${lesson?.title || "this masterclass"}. In this session, I will walk you through the fundamental principles and architectural insights you need to build high-scale, production-ready systems. Stay focused, code along, and feel free to ask me any doubt in real-time.`;

  // Voice profiles per celebrity
  const getVoiceSettings = () => {
    const id = mentor?.id || 1;
    switch (id) {
      case 1: // Elon Musk
        return { pitch: 0.85, rate: 0.95 * playbackSpeed, voiceKeyword: "Alex" };
      case 2: // Sundar Pichai
        return { pitch: 0.95, rate: 0.98 * playbackSpeed, voiceKeyword: "Rishi" };
      case 3: // Oprah Winfrey
        return { pitch: 1.05, rate: 0.95 * playbackSpeed, voiceKeyword: "Samantha" };
      case 4: // Jensen Huang
        return { pitch: 0.90, rate: 1.05 * playbackSpeed, voiceKeyword: "Fred" };
      case 5: // Virat Kohli
        return { pitch: 1.0, rate: 1.05 * playbackSpeed, voiceKeyword: "Rishi" };
      default:
        return { pitch: 1.0, rate: 1.0 * playbackSpeed, voiceKeyword: "" };
    }
  };

  const speakText = (text, onEnd) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (muted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = getVoiceSettings();
    utterance.pitch = settings.pitch;
    utterance.rate = settings.rate;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find((v) =>
        v.name.toLowerCase().includes(settings.voiceKeyword.toLowerCase())
      ) || voices[0];
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Play / Pause handling
  const togglePlay = () => {
    if (!playing) {
      setPlaying(true);
      speakText(lessonScript, () => {
        setPlaying(false);
        setProgress(100);
        onComplete?.();
      });

      // Synchronize progress bar
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            onComplete?.();
            return 100;
          }
          return p + 1;
        });
      }, 400);
    } else {
      setPlaying(false);
      stopSpeech();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  // Stop on unmount or mentor/lesson change
  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    stopSpeech();
    if (intervalRef.current) clearInterval(intervalRef.current);
    return () => {
      stopSpeech();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mentor?.id, lesson?.id]);

  // Handle Asking Live Doubt to Celebrity AI Mentor
  const handleAskMentor = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const userQ = question.trim();
    setQuestion("");
    const newHistory = [...chatHistory, { sender: "user", text: userQ }];
    setChatHistory(newHistory);
    setAsking(true);

    try {
      const response = await aiApi.chat({
        mentorId: mentor?.id || 1,
        message: userQ,
        courseContext: `${lesson?.title || "Course lesson"}: ${lessonScript}`,
      });

      const reply = response.data?.data?.reply || response.data?.reply || "Focus on the core fundamentals and practice daily.";
      setChatHistory([...newHistory, { sender: "mentor", text: reply }]);

      // Speak reply if not muted
      if (!muted) {
        speakText(reply);
      }
    } catch {
      // Graceful local fallback if offline
      const fallbackReply = `From a first-principles perspective, let's break down "${userQ}". What is the core constraint? Eliminate unnecessary steps and test your solution with small inputs first!`;
      setChatHistory([...newHistory, { sender: "mentor", text: fallbackReply }]);
      if (!muted) speakText(fallbackReply);
    } finally {
      setAsking(false);
    }
  };

  if (!mentor || !lesson) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-upto-card shadow-2xl">
      {/* Mentor Video / Audio Stage */}
      <div
        className="relative flex aspect-video flex-col items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at center, ${mentor.accent}25, ${mentor.color} 90%)`,
        }}
      >
        {/* Animated dynamic pulse rings when speaking */}
        {playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="absolute h-52 w-52 animate-ping rounded-full opacity-20"
              style={{ backgroundColor: mentor.accent }}
            />
            <span
              className="absolute h-40 w-40 animate-pulse rounded-full opacity-30"
              style={{ backgroundColor: mentor.accent }}
            />
          </div>
        )}

        {/* Celebrity Avatar with Lip-Sync Waveform Effect */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className={`flex h-28 w-28 items-center justify-center rounded-full text-3xl font-black text-white shadow-2xl ring-4 transition-transform duration-300 ${
                playing ? "ring-blue-400 scale-105" : "ring-white/10"
              }`}
              style={{ background: mentor.accent }}
            >
              {mentor.initials}
            </div>

            {/* Speaking mic indicator */}
            {playing && (
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-md animate-bounce">
                <Mic className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="text-center">
            <p className="text-xl font-black text-white tracking-wide">{mentor.name}</p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-upto-blue/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-upto-blue/30">
                <Sparkles className="h-3 w-3" />
                Celebrity AI Persona
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Mic className="h-3 w-3" />
                {playing ? "Voice Clone Active" : "Voice Synthesis Ready"}
              </span>
            </div>
          </div>

          {/* Central Play/Pause Toggle */}
          <button
            onClick={togglePlay}
            title={playing ? "Pause AI Lecture" : "Play AI Lecture"}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 active:scale-95 shadow-xl border border-white/20"
          >
            {playing ? (
              <Pause className="h-7 w-7 text-white" />
            ) : (
              <Play className="h-7 w-7 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Player Bottom Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
          <div>
            <p className="text-sm font-bold text-white">{lesson.title}</p>
            <p className="text-xs text-gray-400">
              {lesson.duration} · Expert AI Curriculum
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1;
                setPlaybackSpeed(nextSpeed);
                toast.info(`Playback speed set to ${nextSpeed}x`);
              }}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-white/20"
            >
              <Gauge className="h-3.5 w-3.5" />
              {playbackSpeed}x
            </button>

            {/* Mute / Unmute Button */}
            <button
              onClick={() => {
                if (!muted) stopSpeech();
                setMuted(!muted);
                toast.info(muted ? "AI Voice Unmuted" : "AI Voice Muted");
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              {muted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar & Timing */}
      <div className="p-4 border-b border-gray-800">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1 font-medium">
            <Volume2 className="h-3.5 w-3.5 text-blue-400" />
            {mentor.voice}
          </span>
          <span className="font-bold text-blue-400">{progress}% Completed</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full upto-gradient transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {progress >= 100 && (
          <Button variant="gradient" className="mt-4 w-full font-bold" onClick={onComplete}>
            Mark Lesson Complete (+50 XP)
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Interactive Tabs: Teleprompter Transcript / Ask Mentor Live / Lesson Overview */}
      <div className="p-4 bg-upto-card">
        <div className="flex border-b border-gray-800 pb-3 gap-2">
          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "transcript"
                ? "bg-upto-blue text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            AI Lecture Transcript
          </button>
          <button
            onClick={() => setActiveTab("askMentor")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === "askMentor"
                ? "bg-upto-blue text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            Ask {mentor.name.split(" ")[0]} Live Doubts
            {chatHistory.length > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                {chatHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Teleprompter Transcript */}
        {activeTab === "transcript" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Synchronized AI Lecture Transcript</span>
              <span className="text-[11px] text-emerald-400 font-semibold">● Live Audio Sync</span>
            </div>
            <div className="rounded-xl border border-gray-800 bg-upto-dark/60 p-4 text-sm leading-relaxed text-gray-300">
              <p className="whitespace-pre-line">{lessonScript}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Ask Celebrity AI Mentor Live */}
        {activeTab === "askMentor" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-xs text-blue-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-blue-400" />
              <span>
                Ask any question about this lesson. <strong>{mentor.name}</strong> will answer in real-time using their philosophical perspective!
              </span>
            </div>

            {/* Chat Messages */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {chatHistory.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No questions asked yet. Ask {mentor.name.split(" ")[0]} anything!
                </div>
              ) : (
                chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      item.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        item.sender === "user"
                          ? "bg-upto-blue text-white rounded-br-none"
                          : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none"
                      }`}
                    >
                      <p className="font-semibold text-[10px] opacity-75 mb-1">
                        {item.sender === "user" ? "You" : `${mentor.name} (AI Mentor)`}
                      </p>
                      <p className="whitespace-pre-line">{item.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAskMentor} className="flex gap-2">
              <input
                type="text"
                placeholder={`Ask ${mentor.name.split(" ")[0]} a question...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={asking}
                className="flex-1 rounded-xl border border-gray-700 bg-upto-dark px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-upto-blue focus:outline-none"
              />
              <Button type="submit" variant="gradient" disabled={asking || !question.trim()}>
                {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
