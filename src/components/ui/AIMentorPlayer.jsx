import { useState } from "react";
import { Play, Pause, Volume2, Mic, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/button";

export function AIMentorPlayer({ mentor, lesson, onComplete }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!playing) {
      setPlaying(true);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setPlaying(false);
            onComplete?.();
            return 100;
          }
          return p + 2;
        });
      }, 200);
    } else {
      setPlaying(false);
    }
  };

  if (!mentor || !lesson) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-800 bg-upto-card">
      <div
        className="relative flex aspect-video items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${mentor.color}, ${mentor.accent}33)` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-full text-3xl font-black text-white shadow-2xl ring-4 ring-white/10"
            style={{ background: mentor.accent }}
          >
            {mentor.initials}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{mentor.name}</p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-upto-blue/20 px-3 py-1 text-xs font-semibold text-blue-300">
                <Sparkles className="h-3 w-3" />
                AI Mentor
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                <Mic className="h-3 w-3" />
                Voice Clone Active
              </span>
            </div>
          </div>

          <button
            onClick={togglePlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
          >
            {playing ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white ml-0.5" />
            )}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-sm font-semibold text-white">{lesson.title}</p>
          <p className="text-xs text-gray-400">{lesson.duration} · Expert AI Content</p>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5" />
            {mentor.voice}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full upto-gradient transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress >= 100 && (
          <Button variant="gradient" className="mt-4 w-full" onClick={onComplete}>
            Complete Lesson
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
