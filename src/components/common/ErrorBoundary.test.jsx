import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "./ErrorBoundary";

const BuggyComponent = () => {
  throw new Error("Simulated rendering crash");
};

describe("ErrorBoundary Component Tests", () => {
  it("renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <p>Healthy Content</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("Healthy Content")).toBeInTheDocument();
  });

  it("catches render errors and displays accessible fallback UI", () => {
    // Suppress console.error during expected crash test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Try Again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Return to Home/i })).toBeInTheDocument();

    spy.mockRestore();
  });
});
