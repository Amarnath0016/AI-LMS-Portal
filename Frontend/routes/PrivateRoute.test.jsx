import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import * as useAuthModule from "@/hooks/useAuth";

describe("PrivateRoute Role Access Control Tests", () => {
  it("redirects unauthenticated users to /login", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>Protected Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("allows user with matching role to access route", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { role: "instructor" },
    });

    render(
      <MemoryRouter initialEntries={["/instructor-page"]}>
        <Routes>
          <Route
            path="/instructor-page"
            element={
              <PrivateRoute roles={["instructor", "admin"]}>
                <div>Instructor Only Content</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Instructor Only Content")).toBeInTheDocument();
  });

  it("redirects unauthorized user to their role-specific homePath (e.g. instructor -> /instructor-dashboard)", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { role: "instructor" },
    });

    render(
      <MemoryRouter initialEntries={["/admin-only"]}>
        <Routes>
          <Route
            path="/admin-only"
            element={
              <PrivateRoute roles={["admin"]}>
                <div>Admin Secret</div>
              </PrivateRoute>
            }
          />
          <Route path="/instructor-dashboard" element={<div>Instructor Home Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Instructor Home Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Secret")).not.toBeInTheDocument();
  });

  it("redirects unauthorized admin to /admin homePath when hitting student route", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { role: "admin" },
    });

    render(
      <MemoryRouter initialEntries={["/daily-challenge"]}>
        <Routes>
          <Route
            path="/daily-challenge"
            element={
              <PrivateRoute roles={["student"]}>
                <div>Daily Challenge Content</div>
              </PrivateRoute>
            }
          />
          <Route path="/admin" element={<div>Admin Control Hub</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Control Hub")).toBeInTheDocument();
    expect(screen.queryByText("Daily Challenge Content")).not.toBeInTheDocument();
  });
});
