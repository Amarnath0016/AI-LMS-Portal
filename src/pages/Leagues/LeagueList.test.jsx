import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import LeagueList from "./LeagueList";
import * as AuthContextModule from "@/store/AuthContext";
import { quizApi } from "@/api/endpoints";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock endpoints
vi.mock("@/api/endpoints", () => ({
  quizApi: {
    getLeagues: vi.fn(),
    getMyAttempts: vi.fn(),
    getLeagueQuiz: vi.fn(),
    submitQuizAttempt: vi.fn(),
  },
}));

describe("LeagueList Quiz Component Tests", () => {
  it("renders quiz leagues with levels and categories", async () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      user: { name: "Learner", xp: 500 },
    });

    quizApi.getLeagues.mockResolvedValue({
      data: [
        {
          id: 101,
          title: "Python Sprint League",
          category: "Programming",
          level: "Beginner",
          quizzes: 12,
          xp: 1200,
          players: "18K",
          description: "Solve Python basics, loops, functions.",
        },
        {
          id: 102,
          title: "React Master Arena",
          category: "Frontend",
          level: "Intermediate",
          quizzes: 15,
          xp: 1500,
          players: "12K",
          description: "Hooks, reconciliation, state architecture.",
        },
      ],
    });

    quizApi.getMyAttempts.mockResolvedValue({
      data: [],
    });

    render(
      <BrowserRouter>
        <LeagueList />
      </BrowserRouter>
    );

    expect(screen.getByText("Quiz & XP Leagues")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Python Sprint League")).toBeInTheDocument();
      expect(screen.getByText("React Master Arena")).toBeInTheDocument();
    });
  });
});
