import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import AIMentorPlayer from "./AIMentorPlayer";

// Mock endpoints
vi.mock("@/api/endpoints", () => ({
  aiApi: {
    getLessonAudio: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          fullAudioUrl: "/audio/test.mp3",
          duration: 60,
          words: [],
          segments: [{ text: "Welcome to UptoSkills LMS lecture.", duration: 60 }],
        },
      },
    }),
    getVoiceProfile: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          pitch: 1.0,
          rate: 1.0,
          voiceName: "en-US-Neural2",
          isLicensedClone: false,
        },
      },
    }),
    getAvatarConfig: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          avatarUrl: "/avatars/alex.svg",
          avatarType: "svg-canvas-2d",
          isLicensedAvatar: true,
        },
      },
    }),
  },
  courseApi: {
    getLessonPlaybackPosition: vi.fn().mockResolvedValue({
      data: { success: true, data: { currentTime: 0, progress: 0 } },
    }),
    saveLessonPlaybackPosition: vi.fn().mockResolvedValue({ data: { success: true } }),
    completeLesson: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe("AIMentorPlayer Accessibility & Interaction Tests", () => {
  const mockMentor = {
    _id: "m-001",
    id: 1,
    name: "Dr. Alex Vance",
    type: "original",
    accent: "#2563EB",
    color: "#0F172A",
    disclosureText: "AI-generated mentor. Not the real person.",
    voice: "Deep, visionary tone",
  };

  const mockLesson = {
    _id: "l-001",
    id: 101,
    title: "Lesson 1: First Principles Thinking",
    script: "Welcome to the lesson on first principles thinking.",
    duration: "10 mins",
  };

  it("renders player with accessible ARIA region and label", () => {
    render(
      <AIMentorPlayer
        mentor={mockMentor}
        lesson={mockLesson}
        courseId="c-001"
      />
    );

    const region = screen.getByRole("region", { name: /AI Mentor Video Lecture Player/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("tabIndex", "0");
  });

  it("renders mandatory ethics & synthetic persona disclosure banner", () => {
    render(
      <AIMentorPlayer
        mentor={mockMentor}
        lesson={mockLesson}
        courseId="c-001"
      />
    );

    expect(screen.getByText(/AI-generated mentor. Not the real person./i)).toBeInTheDocument();
  });

  it("renders keyboard-operable controls (play/pause, captions toggle, mute, seek)", () => {
    render(
      <AIMentorPlayer
        mentor={mockMentor}
        lesson={mockLesson}
        courseId="c-001"
      />
    );

    expect(screen.getByRole("button", { name: /Play lecture/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Disable closed captions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mute audio/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /Seek playback position/i })).toBeInTheDocument();
  });

  it("responds to keyboard shortcuts on the player container", () => {
    render(
      <AIMentorPlayer
        mentor={mockMentor}
        lesson={mockLesson}
        courseId="c-001"
      />
    );

    const player = screen.getByRole("region", { name: /AI Mentor Video Lecture Player/i });

    // Press 'c' to toggle captions (default was enabled, so now disabled)
    fireEvent.keyDown(player, { key: "c" });
    expect(screen.getByRole("button", { name: /Enable closed captions/i })).toBeInTheDocument();

    // Press 'm' to mute
    fireEvent.keyDown(player, { key: "m" });
    expect(screen.getByRole("button", { name: /Unmute audio/i })).toBeInTheDocument();
  });
});
