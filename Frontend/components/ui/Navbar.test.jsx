import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./Navbar";
import * as useAuthModule from "@/hooks/useAuth";
import * as AuthContextModule from "@/store/AuthContext";
import * as useWishlistModule from "@/hooks/useWishlist";

describe("Navbar Component Role Navigation Tests", () => {
  const mockAuthContext = {
    logout: vi.fn(),
    theme: "dark",
    toggleTheme: vi.fn(),
  };

  it("renders public links when user is not authenticated", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: false,
      user: null,
    });
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue(mockAuthContext);
    vi.spyOn(useWishlistModule, "useWishlist").mockReturnValue({ wishlistCount: 0 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^courses$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^start journey$/i })).toBeInTheDocument();
  });

  it("renders student top nav and student extras for student role", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { role: "student" },
    });
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue(mockAuthContext);
    vi.spyOn(useWishlistModule, "useWishlist").mockReturnValue({ wishlistCount: 3 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^courses$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^subscriptions$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^leagues$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^mentors$/i })).toBeInTheDocument();

    // Student extras
    expect(screen.getByRole("button", { name: /my subscriptions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /saved courses/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /my xp/i })).toBeInTheDocument();
  });

  it("renders instructor top nav and hides student extras for instructor role", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { role: "instructor" },
    });
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue(mockAuthContext);
    vi.spyOn(useWishlistModule, "useWishlist").mockReturnValue({ wishlistCount: 0 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByRole("link", { name: /^dashboard$/i })).toHaveAttribute("href", "/instructor-dashboard");
    expect(screen.getByRole("link", { name: /^my courses$/i })).toHaveAttribute("href", "/instructor/courses");
    expect(screen.getByRole("link", { name: /^analytics$/i })).toHaveAttribute("href", "/analytics");
    expect(screen.getByRole("link", { name: /^discussions$/i })).toHaveAttribute("href", "/forum");

    // Student extras MUST be hidden
    expect(screen.queryByRole("button", { name: /saved courses/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /my subscriptions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /my xp/i })).not.toBeInTheDocument();
  });

  it("renders admin top nav and hides student extras for admin role", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      isAuthenticated: true,
      user: { role: "admin" },
    });
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue(mockAuthContext);
    vi.spyOn(useWishlistModule, "useWishlist").mockReturnValue({ wishlistCount: 0 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByRole("link", { name: /^dashboard$/i })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: /^users$/i })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: /^courses$/i })).toHaveAttribute("href", "/admin/courses");
    expect(screen.getByRole("link", { name: /^analytics$/i })).toHaveAttribute("href", "/analytics");

    // Student extras MUST be hidden
    expect(screen.queryByRole("button", { name: /saved courses/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /my subscriptions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /my xp/i })).not.toBeInTheDocument();
  });
});
