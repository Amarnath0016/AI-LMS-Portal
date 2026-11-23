import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CourseCard } from "./CourseCard";
import * as AuthContextModule from "@/store/AuthContext";
import * as WishlistContextModule from "@/store/WishlistContext";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("CourseCard Wishlist Functionality", () => {
  const sampleCourse = {
    id: 1,
    _id: "course-123",
    title: "AI & Fullstack Engineering",
    tag: "Engineering",
    level: "Intermediate",
    league: "Pro Track",
    price: 4999,
  };

  it("renders wishlist save button with aria-label and heart icon", () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: true,
      user: { name: "Test User" },
    });

    render(
      <BrowserRouter>
        <CourseCard course={sampleCourse} isWishlisted={false} />
      </BrowserRouter>
    );

    const wishlistBtn = screen.getByRole("button", { name: /save .* to wishlist/i });
    expect(wishlistBtn).toBeInTheDocument();
  });

  it("indicates active saved state when course is wishlisted", () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: true,
      user: { name: "Test User" },
    });

    render(
      <BrowserRouter>
        <CourseCard course={sampleCourse} isWishlisted={true} />
      </BrowserRouter>
    );

    const removeBtn = screen.getByRole("button", { name: /remove .* from wishlist/i });
    expect(removeBtn).toBeInTheDocument();
  });

  it("calls onWishlistToggle prop when clicked by authenticated user", async () => {
    const handleToggle = vi.fn().mockResolvedValue(true);
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: true,
      user: { name: "Test User" },
    });

    render(
      <BrowserRouter>
        <CourseCard course={sampleCourse} isWishlisted={false} onWishlistToggle={handleToggle} />
      </BrowserRouter>
    );

    const wishlistBtn = screen.getByRole("button", { name: /save .* to wishlist/i });
    fireEvent.click(wishlistBtn);

    await waitFor(() => {
      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith(sampleCourse);
    });
  });

  it("prompts user to sign in if unauthenticated user clicks wishlist button", async () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <BrowserRouter>
        <CourseCard course={sampleCourse} isWishlisted={false} />
      </BrowserRouter>
    );

    const wishlistBtn = screen.getByRole("button", { name: /save .* to wishlist/i });
    fireEvent.click(wishlistBtn);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Please sign in to save courses to your wishlist"),
      expect.anything()
    );
  });
});
