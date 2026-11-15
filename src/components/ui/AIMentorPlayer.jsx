import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Sparkles,
  ChevronRight,
  Send,
  Loader2,
  BookOpen,
  HelpCircle,
  Gauge,
  Bot,
  AlertTriangle,
  RefreshCw,
  Subtitles,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { aiApi, enrollmentApi } from "@/api/endpoints";
import { toast } from "sonner";

export function AIMentorPlayer({ mentor, lesson, courseId, onComplete }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(Boolean(lesson?.completed));
  const [muted, setMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [activeTab, setActiveTab] = useState("transcript"); // transcript | askMentor

  // Real TTS audio data from API
  const [audioData, setAudioData] = useState(null);
  const [voiceConfig, setVoiceConfig] = useState(null);
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState(null);
  const [useFallbackVoice, setUseFallbackVoice] = useState(false);

  // Mentor Live Doubts
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // HTML5 Audio Element Ref & Fallback Speech Ref
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  const lessonScript =
    lesson?.script ||
    lesson?.text ||
    `Welcome to ${lesson?.title || "this masterclass"}. In this session, I will walk you through the fundamental principles and architectural insights you need to build high-scale, production-ready systems.`;

  // 1. Fetch Mentor Voice Config & Lesson Audio from API
  useEffect(() => {
    let isMounted = true;
    const lessonId = lesson?._id || lesson?.id;
    const mentorId = mentor?._id || mentor?.id || 1;

    if (!lessonId) return;

    const loadVoiceAndAudio = async () => {
      setAudioLoading(true);
      setAudioError(null);
      setPlaying(false);
      setCurrentTime(0);
      setProgress(0);

      try {
        // Fetch mentor voice config directly from API (no duplicated client settings)
        try {
          const vRes = await aiApi.getVoiceProfile(mentorId);
          if (isMounted && vRes.data?.data) {
            setVoiceConfig(vRes.data.data);
          }
        } catch {
          // Non-blocking voice profile fallback
        }

        // Generate or fetch cached real TTS audio per script segment
        const audioRes = await aiApi.getLessonAudio(lessonId, { mentorId });
        if (isMounted && audioRes.data?.data) {
          const data = audioRes.data.data;
          setAudioData(data);
          setDuration(data.totalDuration || 0);

          // Fetch saved resume position
          try {
            const posRes = await enrollmentApi.getPlaybackPosition(lessonId, courseId);
            if (isMounted && posRes.data?.data) {
              const savedSec = posRes.data.data.playbackPositionSeconds || 0;
              const isDone = Boolean(posRes.data.data.completed);
              if (isDone) setCompleted(true);

              if (savedSec > 2 && !isDone) {
                setCurrentTime(savedSec);
                if (audioRef.current) {
                  audioRef.current.currentTime = savedSec;
                }
                const pct = data.totalDuration > 0 ? Math.floor((savedSec / data.totalDuration) * 100) : 0;
                setProgress(pct);
                toast.info(`Resumed lesson from ${formatSeconds(savedSec)}`);
              }
            }
          } catch {
            // Non-blocking position fetch
          }
        }
      } catch (err) {
        if (isMounted) {
          setAudioError("Real audio track could not be loaded. Browser voice available as fallback.");
        }
      } finally {
        if (isMounted) setAudioLoading(false);
      }
    };

    loadVoiceAndAudio();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [lesson?._id, lesson?.id, mentor?._id, mentor?.id, courseId]);

  // Synchronize playback speed with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Synchronize mute state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  // Save playback position to server (debounced or on pause)
  const persistPosition = async (currentSec, pct) => {
    const lessonId = lesson?._id || lesson?.id;
    if (!lessonId || !courseId) return;

    if (Math.abs(currentSec - lastSavedTimeRef.current) < 3 && pct < 90) return;
    lastSavedTimeRef.current = currentSec;

    try {
      await enrollmentApi.savePlaybackPosition(lessonId, {
        courseId,
        currentTime: currentSec,
        progressPercent: pct,
      });
    } catch {
      // Background persistence failure is non-blocking
    }
  };

  // Driven by audio currentTime and duration (Requirement 3)
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration || duration || 1;
    setCurrentTime(ct);

    const pct = Math.min(100, Math.floor((ct / dur) * 100));
    setProgress(pct);

    // Mark lesson complete at >=90% watched
    if (pct >= 90 && !completed) {
      setCompleted(true);
      onComplete?.();
      persistPosition(ct, pct);
      toast.success("Lesson Complete! (90%+ Watched) +50 XP");
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (useFallbackVoice) {
      toggleFallbackSpeech();
      return;
    }

    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      persistPosition(currentTime, progress);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setAudioError("Playback was blocked or audio failed. You can use fallback voice mode.");
          setPlaying(false);
        });
    }
  };

  // Seek audio position directly
  const handleSeek = (newSeconds) => {
    const target = Math.max(0, Math.min(duration || 100, newSeconds));
    setCurrentTime(target);
    const dur = duration || 1;
    const pct = Math.min(100, Math.floor((target / dur) * 100));
    setProgress(pct);

    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
    persistPosition(target, pct);
  };

  // Fallback Voice: Browser Web Speech API with visible notice (Requirement 2)
  const toggleFallbackSpeech = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Web Speech API not supported in this browser.");
      return;
    }

    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      persistPosition(currentTime, progress);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lessonScript);
    utterance.pitch = voiceConfig?.pitch || 1.0;
    utterance.rate = (voiceConfig?.rate || 1.0) * playbackSpeed;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && voiceConfig?.voiceKeyword) {
      const match = voices.find((v) =>
        v.name.toLowerCase().includes(voiceConfig.voiceKeyword.toLowerCase())
      );
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => {
      setPlaying(false);
      setProgress(100);
      setCompleted(true);
      onComplete?.();
    };
    utterance.onerror = () => setPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Active Caption based on current word / segment (Requirement 4)
  const currentWords = audioData?.words || [];
  const activeWord = currentWords.find(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Active segment
  const activeSegment = (audioData?.segments || []).find((seg, idx) => {
    let segStart = 0;
    for (let i = 0; i < idx; i++) {
      segStart += audioData.segments[i].duration;
    }
    const segEnd = segStart + seg.duration;
    return currentTime >= segStart && currentTime <= segEnd;
  }) || audioData?.segments?.[0];

  // Helper time formatter
  const formatSeconds = (sec) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${m}:${remS < 10 ? "0" : ""}${remS}`;
  };

  // Mentor Live Doubt Submission
  const submitQuestion = async (userQ) => {
    if (!userQ || asking) return;

    const newHistory = [...chatHistory, { sender: "user", text: userQ }];
    setChatHistory(newHistory);
    setAsking(true);

    const formattedHistory = chatHistory
      .filter((h) => h.sender === "user" || h.sender === "mentor")
      .map((h) => ({
        role: h.sender === "user" ? "user" : "model",
        text: h.text,
      }));

    try {
      const response = await aiApi.chat({
        mentorId: mentor?.id || mentor?._id || 1,
        courseId: courseId || lesson?.courseId,
        message: userQ,
        history: formattedHistory,
      });

      const responseData = response.data?.data || response.data || {};
      const reply = responseData.reply || "Focus on the core fundamentals and practice daily.";
      const citations = responseData.citations || [];
      const label = responseData.label || "AI-generated mentor";

      setChatHistory([
        ...newHistory,
        {
          sender: "mentor",
          text: reply,
          citations,
          label,
        },
      ]);
    } catch (error) {
      const status = error.response?.status;
      const is429 = status === 429;
      let errorMsg = "The AI Mentor service is temporarily unavailable. Please retry in a moment.";

      if (is429) {
        errorMsg = "Daily AI mentor quota exceeded. Please try again tomorrow.";
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      setChatHistory([
        ...newHistory,
        {
          sender: "error",
          text: errorMsg,
          retryable: !is429,
          failedQuestion: userQ,
        },
      ]);
      toast.error(errorMsg);
    } finally {
      setAsking(false);
    }
  };

  const handleAskMentor = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    submitQuestion(q);
  };

  if (!mentor || !lesson) return null;

  const audioSourceUrl = audioData?.fullAudioUrl || audioData?.segments?.[0]?.audioUrl || "";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-upto-card shadow-2xl">
      {/* HTML5 Audio Element for Real TTS Playback */}
      {audioSourceUrl && !useFallbackVoice && (
        <audio
          ref={audioRef}
          src={audioSourceUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            persistPosition(currentTime, progress);
          }}
          onEnded={() => {
            setPlaying(false);
            setProgress(100);
            setCompleted(true);
            onComplete?.();
          }}
          onError={() => {
            setAudioError("Real audio file could not be played. Switched to fallback mode.");
            setUseFallbackVoice(true);
          }}
        />
      )}

      {/* Fallback Voice Notice Banner (Requirement 2) */}
      {useFallbackVoice && (
        <div className="flex items-center justify-between bg-amber-500/10 px-4 py-2 text-xs text-amber-200 border-b border-amber-500/20">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Using device Web Speech fallback voice (Licensed audio unavailable).</span>
          </span>
          <button
            onClick={() => {
              setUseFallbackVoice(false);
              setAudioError(null);
            }}
            className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-100 hover:bg-amber-500/30"
          >
            Retry Real Audio
          </button>
        </div>
      )}

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

        {/* Celebrity Avatar with Audio Visualizer Effect */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-white shadow-2xl ring-4 transition-transform duration-300 ${
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
            <p className="text-lg font-black text-white tracking-wide">{mentor.name}</p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-upto-blue/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 border border-upto-blue/30">
                <Sparkles className="h-3 w-3" />
                AI-Generated Persona
              </span>

              {/* Requirement 5: Licensed voice clone label ONLY if truly licensed */}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                <Mic className="h-3 w-3" />
                {voiceConfig?.isLicensedClone
                  ? "Licensed Voice Clone Active"
                  : useFallbackVoice
                  ? "Device Fallback Voice"
                  : "Consented Synthetic Voice"}
              </span>
            </div>
          </div>

          {/* Central Play/Pause Toggle */}
          <button
            onClick={togglePlay}
            disabled={audioLoading}
            title={playing ? "Pause AI Lecture" : "Play AI Lecture"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 active:scale-95 shadow-xl border border-white/20 disabled:opacity-50"
          >
            {audioLoading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : playing ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Live Synchronized Closed-Caption Overlay (Requirement 4) */}
        {showCaptions && (
          <div className="absolute bottom-16 left-4 right-4 z-20 flex justify-center pointer-events-none">
            <div className="max-w-[90%] rounded-xl bg-black/85 backdrop-blur-md px-4 py-2 text-center text-xs text-white shadow-2xl border border-white/10">
              {activeWord ? (
                <p className="font-medium text-gray-200">
                  <span className="text-blue-400 font-bold underline decoration-blue-500 decoration-2">
                    {activeWord.word}
                  </span>{" "}
                  {activeSegment?.text
                    ?.replace(activeWord.word, "")
                    .slice(0, 100)}
                </p>
              ) : (
                <p className="text-gray-300 text-xs italic">
                  {activeSegment?.text ? `"${activeSegment.text.slice(0, 110)}..."` : lessonScript.slice(0, 100)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Player Bottom Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
          <div>
            <p className="text-xs font-bold text-white line-clamp-1">{lesson.title}</p>
            <p className="text-[11px] text-gray-400">
              {formatSeconds(currentTime)} / {formatSeconds(duration || 60)}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Captions [CC] */}
            <button
              onClick={() => {
                setShowCaptions(!showCaptions);
                toast.info(showCaptions ? "Captions Disabled" : "Live Captions Enabled");
              }}
              title="Toggle Closed Captions"
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors ${
                showCaptions
                  ? "bg-blue-600/40 text-blue-200 border border-blue-500/30"
                  : "bg-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Subtitles className="h-3.5 w-3.5" />
              CC
            </button>

            {/* Speed Selector */}
            <button
              onClick={() => {
                const nextSpeed =
                  playbackSpeed === 1 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
                setPlaybackSpeed(nextSpeed);
                toast.info(`Playback speed set to ${nextSpeed}x`);
              }}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white hover:bg-white/20"
            >
              <Gauge className="h-3.5 w-3.5" />
              {playbackSpeed}x
            </button>

            {/* Mute / Unmute Button */}
            <button
              onClick={() => {
                setMuted(!muted);
                toast.info(muted ? "AI Voice Unmuted" : "AI Voice Muted");
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Progress & Seek Bar (Requirement 3) */}
      <div className="p-4 border-b border-gray-800">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Volume2 className="h-3.5 w-3.5 text-blue-400" />
            <span>{voiceConfig?.voiceName || mentor.voice || "Synthetic Audio"}</span>
          </span>
          <span className="font-bold text-blue-400">
            {progress}% Completed {progress >= 90 && "✔ (Passed)"}
          </span>
        </div>

        {/* Interactive Seek Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-gray-800 accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Resume Position & Auto-Complete Banner */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
          <span>{formatSeconds(currentTime)}</span>
          <span>{completed ? "Completed (+50 XP)" : "Auto-completes at 90% watched"}</span>
          <span>{formatSeconds(duration || 60)}</span>
        </div>

        {completed && (
          <Button
            variant="gradient"
            className="mt-3 w-full font-bold text-xs h-9"
            onClick={onComplete}
          >
            Lesson Completed (+50 XP Awarded)
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Interactive Tabs: Transcript / Ask Mentor Live */}
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
            Synchronized Transcript
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

        {/* Tab 1: Synchronized Interactive Transcript (Requirement 4) */}
        {activeTab === "transcript" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Interactive Segment Transcript (Click to seek audio)</span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                ● Word Sync Active
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 rounded-xl border border-gray-800 bg-upto-dark/60 p-4 text-sm leading-relaxed text-gray-300">
              {audioData?.segments && audioData.segments.length > 0 ? (
                audioData.segments.map((seg, sIdx) => {
                  let segStart = 0;
                  for (let i = 0; i < sIdx; i++) {
                    segStart += audioData.segments[i].duration;
                  }
                  const isCurrent = currentTime >= segStart && currentTime <= segStart + seg.duration;

                  return (
                    <div
                      key={sIdx}
                      onClick={() => handleSeek(segStart)}
                      className={`cursor-pointer rounded-lg p-2.5 transition-colors ${
                        isCurrent
                          ? "bg-blue-900/30 border border-blue-600/40 text-white"
                          : "hover:bg-gray-800/60 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="font-semibold text-blue-300">
                          Segment {sIdx + 1}
                        </span>
                        <span>{formatSeconds(segStart)}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{seg.text}</p>
                    </div>
                  );
                })
              ) : (
                <p className="whitespace-pre-line text-xs">{lessonScript}</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Ask Celebrity AI Mentor Live */}
        {activeTab === "askMentor" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-xs text-blue-300 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 text-blue-400" />
              <span>
                Ask questions grounded in this course syllabus. <strong>{mentor.name}</strong> will guide you step-by-step.
              </span>
            </div>

            {/* Chat Messages */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {chatHistory.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No questions asked yet. Ask {mentor.name.split(" ")[0]} anything about this lesson!
                </div>
              ) : (
                chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      item.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {item.sender === "user" ? (
                      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed bg-upto-blue text-white rounded-br-none shadow-sm">
                        <p className="font-semibold text-[10px] opacity-75 mb-1">You</p>
                        <p className="whitespace-pre-line">{item.text}</p>
                      </div>
                    ) : item.sender === "mentor" ? (
                      <div className="max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <p className="font-semibold text-[11px] text-white">
                            {mentor.name}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300 border border-blue-500/20">
                            <Sparkles className="h-2.5 w-2.5" />
                            {item.label || "AI-generated mentor"}
                          </span>
                        </div>
                        <p className="whitespace-pre-line">{item.text}</p>

                        {/* Citations display */}
                        {item.citations && item.citations.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-gray-700/60">
                            <p className="text-[10px] font-semibold text-gray-400 mb-1">
                              Lesson Citations:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.citations.map((cite, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-500/20"
                                >
                                  <BookOpen className="h-2.5 w-2.5" />
                                  {cite.replace(/^\[Citation:\s*/, "").replace(/\]$/, "")}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Error Notice */
                      <div className="max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed bg-red-950/40 text-red-200 border border-red-800/50 rounded-bl-none shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1 text-red-400 font-bold text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Service Notice</span>
                        </div>
                        <p className="whitespace-pre-line">{item.text}</p>
                      </div>
                    )}
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
              <Button
                type="submit"
                variant="gradient"
                disabled={asking || !question.trim()}
              >
                {asking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
