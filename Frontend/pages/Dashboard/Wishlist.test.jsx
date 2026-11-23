import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import WishlistPage from "./Wishlist";
import { wishlistApi, enrollmentApi } from "@/api/endpoints";
import * as AuthContextModule from "@/store/AuthContext";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/api/endpoints", () => ({
  wishlistApi: {
    getAll: vi.fn(),
    remove: vi.fn(),
  },
  courseApi: {
    enroll: vi.fn(),
  },
  enrollmentApi: {
    getMyEnrollments: vi.fn(),
  },
}));

describe("WishlistPage Component Tests", () => {
  it("renders empty state with browse catalog button when no courses saved", async () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: true,
      user: { name: "Learner" },
    });

    wishlistApi.getAll.mockResolvedValue({
      data: { success: true, count: 0, data: [] },
    });
    enrollmentApi.getMyEnrollments.mockResolvedValue({
      data: { success: true, data: [] },
    });

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /browse course catalog/i })).toBeInTheDocument();
    });
  });

  it("renders saved courses and allows removing course from wishlist", async () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: true,
      user: { name: "Learner" },
    });

    const savedCourse = {
      _id: "c-101",
      id: 101,
      title: "Mastering Node.js Microservices",
      tag: "Backend",
      league: "Advanced",
      price: 2999,
      duration: "6 weeks",
      xp: 800,
    };

    wishlistApi.getAll.mockResolvedValue({
      data: { success: true, count: 1, data: [savedCourse] },
    });
    enrollmentApi.getMyEnrollments.mockResolvedValue({
      data: { success: true, data: [] },
    });
    wishlistApi.remove.mockResolvedValue({
      data: { success: true, message: "Course removed" },
    });

    render(
      <BrowserRouter>
        <WishlistPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Mastering Node.js Microservices")).toBeInTheDocument();
    });

    const removeBtn = screen.getByTitle("Remove from wishlist");
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(wishlistApi.remove).toHaveBeenCalledWith("c-101");
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Removed "Mastering Node.js Microservices" from wishlist')
      );
    });
  });
});
