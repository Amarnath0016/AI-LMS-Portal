import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import * as AuthContextModule from "@/store/AuthContext";
import { authApi } from "@/api/endpoints";

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
  authApi: {
    login: vi.fn(),
  },
}));

describe("Login Component Tests", () => {
  it("renders email, password inputs and submit button", () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      login: vi.fn(),
      user: null,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("submits login credentials successfully on valid input", async () => {
    const mockContextLogin = vi.fn();
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      login: mockContextLogin,
      user: null,
    });

    authApi.login.mockResolvedValue({
      data: {
        user: { id: "u-1", name: "Learner", role: "student" },
        token: "fake-jwt-token",
      },
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Email/i), {
      target: { value: "learner@uptoskills.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "Password123!" },
    });

    const submitBtn = screen.getByRole("button", { name: /Sign in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "learner@uptoskills.com",
        password: "Password123!",
        role: "student",
        adminCode: "",
      });
      expect(mockContextLogin).toHaveBeenCalledWith(
        { id: "u-1", name: "Learner", role: "student" },
        "fake-jwt-token"
      );
    });
  });

  it("prompts for admin access code when admin role is selected and submitted", async () => {
    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      login: vi.fn(),
      user: null,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const adminBtn = screen.getByRole("button", { name: /^admin$/i });
    fireEvent.click(adminBtn);

    fireEvent.change(screen.getByLabelText(/^Email/i), {
      target: { value: "admin@uptoskills.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "AdminSecret123!" },
    });

    const submitBtn = screen.getByRole("button", { name: /Sign in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/Admin Access Code/i)).toBeInTheDocument();
    });
  });
});
