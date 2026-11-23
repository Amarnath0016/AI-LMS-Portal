import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import * as useAuthModule from "@/hooks/useAuth";

// Mock endpoints so no API call crashes
vi.mock("@/api/endpoints", () => ({
  courseApi: { getAll: vi.fn().mockResolvedValue({ data: [] }) },
  adminApi: { getInstructorApplications: vi.fn().mockResolvedValue({ data: [] }) },
  instructorApi: { getDashboard: vi.fn().mockResolvedValue({ data: {} }) },
}));

describe("Sidebar Component Role Rendering Tests", () => {
  it("renders Student Hub sections for student role", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: { role: "student", streak: 5, xp: 250 },
      isAuthenticated: true,
    });

    render(
      <BrowserRouter>
        <Sidebar role="student" />
      </BrowserRouter>
    );

    const aside = document.querySelector("aside");
    expect(aside).toBeInTheDocument();
    const asideQueries = within(aside);

    expect(asideQueries.getAllByText("Student Hub").length).toBeGreaterThanOrEqual(1);
    expect(asideQueries.getByText("My Learning & Goals")).toBeInTheDocument();
    expect(asideQueries.getByText("Community & Support")).toBeInTheDocument();
    expect(asideQueries.getByText("Daily Challenge")).toBeInTheDocument();
    expect(asideQueries.getByText("Course Catalog")).toBeInTheDocument();
    expect(asideQueries.getByText("My Leagues")).toBeInTheDocument();
  });

  it("renders Instructor Studio sections for instructor role", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: { role: "instructor" },
      isAuthenticated: true,
    });

    render(
      <BrowserRouter>
        <Sidebar role="instructor" />
      </BrowserRouter>
    );

    const aside = document.querySelector("aside");
    expect(aside).toBeInTheDocument();
    const asideQueries = within(aside);

    expect(asideQueries.getByText("Instructor Studio")).toBeInTheDocument();
    expect(asideQueries.getByText("Teaching")).toBeInTheDocument();
    expect(asideQueries.getByText("Students & Insights")).toBeInTheDocument();
    expect(asideQueries.getByText("Community & Account")).toBeInTheDocument();
    expect(asideQueries.getByText("My Courses")).toBeInTheDocument();
    expect(asideQueries.getByText("Create Course")).toBeInTheDocument();
    expect(asideQueries.getByText("Student Progress")).toBeInTheDocument();
    expect(asideQueries.getByText("Earnings")).toBeInTheDocument();

    // Student-only links must not be present
    expect(asideQueries.queryByText("Daily Challenge")).not.toBeInTheDocument();
    expect(asideQueries.queryByText("My Leagues")).not.toBeInTheDocument();
    expect(asideQueries.queryByText("Wishlist")).not.toBeInTheDocument();
  });

  it("renders Admin Panel sections for admin role", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      user: { role: "admin" },
      isAuthenticated: true,
    });

    render(
      <BrowserRouter>
        <Sidebar role="admin" />
      </BrowserRouter>
    );

    const aside = document.querySelector("aside");
    expect(aside).toBeInTheDocument();
    const asideQueries = within(aside);

    expect(asideQueries.getByText("Admin Panel")).toBeInTheDocument();
    expect(asideQueries.getByText("Overview")).toBeInTheDocument();
    expect(asideQueries.getByText("User Management")).toBeInTheDocument();
    expect(asideQueries.getByText("Content Management")).toBeInTheDocument();
    expect(asideQueries.getByText("Billing")).toBeInTheDocument();
    expect(asideQueries.getByText("System")).toBeInTheDocument();
    expect(asideQueries.getByText("Instructor Applications")).toBeInTheDocument();
    expect(asideQueries.getByText("Course Approval")).toBeInTheDocument();
    expect(asideQueries.getByText("AI Mentors")).toBeInTheDocument();
    expect(asideQueries.getByText("Subscription Plans")).toBeInTheDocument();
    expect(asideQueries.getByText("Settings")).toBeInTheDocument();
  });
});
