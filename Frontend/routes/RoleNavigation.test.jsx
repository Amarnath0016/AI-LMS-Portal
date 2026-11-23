import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { canAccessPath, getHomePath } from "@/utils/roleRedirect";
import { PrivateRoute } from "./PrivateRoute";
import Login from "@/pages/Auth/Login";
import * as useAuthModule from "@/hooks/useAuth";
import * as AuthContextModule from "@/store/AuthContext";
import { authApi } from "@/api/endpoints";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/api/endpoints", () => ({
  authApi: {
    login: vi.fn(),
  },
}));

describe("Role Navigation & Access Control Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. canAccessPath and getHomePath utility rules", () => {
    it("returns correct home paths for all roles", () => {
      expect(getHomePath("student")).toBe("/dashboard");
      expect(getHomePath("instructor")).toBe("/instructor-dashboard");
      expect(getHomePath("admin")).toBe("/admin");
      expect(getHomePath("unknown")).toBe("/dashboard");
    });

    it("verifies admin-only routes", () => {
      expect(canAccessPath("admin", "/admin")).toBe(true);
      expect(canAccessPath("admin", "/admin/users")).toBe(true);
      expect(canAccessPath("instructor", "/admin")).toBe(false);
      expect(canAccessPath("student", "/admin")).toBe(false);
    });

    it("verifies instructor & admin routes", () => {
      expect(canAccessPath("instructor", "/instructor-dashboard")).toBe(true);
      expect(canAccessPath("instructor", "/instructor/courses")).toBe(true);
      expect(canAccessPath("instructor", "/analytics")).toBe(true);
      expect(canAccessPath("admin", "/instructor-dashboard")).toBe(true);
      expect(canAccessPath("student", "/instructor-dashboard")).toBe(false);
      expect(canAccessPath("student", "/instructor/courses")).toBe(false);
    });

    it("verifies student-only routes", () => {
      expect(canAccessPath("student", "/dashboard")).toBe(true);
      expect(canAccessPath("student", "/daily-challenge")).toBe(true);
      expect(canAccessPath("student", "/leagues")).toBe(true);
      expect(canAccessPath("instructor", "/dashboard")).toBe(false);
      expect(canAccessPath("admin", "/dashboard")).toBe(false);
    });

    it("verifies shared routes for all roles", () => {
      const roles = ["student", "instructor", "admin"];
      roles.forEach((r) => {
        expect(canAccessPath(r, "/profile")).toBe(true);
        expect(canAccessPath(r, "/notifications")).toBe(true);
        expect(canAccessPath(r, "/support")).toBe(true);
        expect(canAccessPath(r, "/forum")).toBe(true);
        expect(canAccessPath(r, "/feedback")).toBe(true);
        expect(canAccessPath(r, "/courses")).toBe(true);
        expect(canAccessPath(r, "/courses/c-101")).toBe(true);
      });
    });
  });

  describe("2. Login component role-based redirection", () => {
    it("Login as student -> lands on /dashboard", async () => {
      const mockLogin = vi.fn();
      vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
        login: mockLogin,
        user: null,
      });

      authApi.login.mockResolvedValueOnce({
        data: {
          user: { id: 1, name: "Student Shailesh", role: "student" },
          token: "jwt-student-token",
        },
      });

      let testLocation;
      function LocationWatcher() {
        testLocation = useLocation();
        return null;
      }

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <LocationWatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<div>Student Hub Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/^Email/i), {
        target: { value: "shailesh@uptoskills.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: "student123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(testLocation.pathname).toBe("/dashboard");
      });
    });

    it("Login as instructor -> lands on /instructor-dashboard", async () => {
      const mockLogin = vi.fn();
      vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
        login: mockLogin,
        user: null,
      });

      authApi.login.mockResolvedValueOnce({
        data: {
          user: { id: 3, name: "Instructor Priya", role: "instructor" },
          token: "jwt-instructor-token",
        },
      });

      let testLocation;
      function LocationWatcher() {
        testLocation = useLocation();
        return null;
      }

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <LocationWatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/instructor-dashboard" element={<div>Instructor Studio Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      const instructorTab = screen.getByRole("button", { name: /^instructor$/i });
      fireEvent.click(instructorTab);

      fireEvent.change(screen.getByLabelText(/^Email/i), {
        target: { value: "priya.mentor@uptoskills.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: "mentor123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(testLocation.pathname).toBe("/instructor-dashboard");
      });
    });

    it("Login as admin (with correct admin code) -> lands on /admin", async () => {
      const mockLogin = vi.fn();
      vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
        login: mockLogin,
        user: null,
      });

      authApi.login.mockResolvedValueOnce({
        data: {
          user: { id: 2, name: "Admin Lead", role: "admin" },
          token: "jwt-admin-token",
        },
      });

      let testLocation;
      function LocationWatcher() {
        testLocation = useLocation();
        return null;
      }

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <LocationWatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<div>Admin Panel Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      const adminTab = screen.getByRole("button", { name: /^admin$/i });
      fireEvent.click(adminTab);

      fireEvent.change(screen.getByLabelText(/^Email/i), {
        target: { value: "admin@uptoskills.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: "admin123" },
      });

      // Clicking sign in with admin selected opens admin code field
      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Admin Access Code/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Admin Access Code/i), {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Verify & Sign In/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(testLocation.pathname).toBe("/admin");
      });
    });

    it("shows toast notification when backendUser.role differs from clicked tab", async () => {
      const mockLogin = vi.fn();
      vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
        login: mockLogin,
        user: null,
      });

      // User clicked "instructor" tab, but backend account is a student
      authApi.login.mockResolvedValueOnce({
        data: {
          user: { id: 10, name: "Learner User", role: "student" },
          token: "jwt-token",
        },
      });

      let testLocation;
      function LocationWatcher() {
        testLocation = useLocation();
        return null;
      }

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <LocationWatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<div>Student Hub</div>} />
          </Routes>
        </MemoryRouter>
      );

      const instructorTab = screen.getByRole("button", { name: /^instructor$/i });
      fireEvent.click(instructorTab);

      fireEvent.change(screen.getByLabelText(/^Email/i), {
        target: { value: "learner@uptoskills.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith(
          expect.stringContaining("This account is registered as student. Redirecting to your dashboard.")
        );
        expect(testLocation.pathname).toBe("/dashboard");
      });
    });

    it("ignores stale from location when unauthorized and uses homePath", async () => {
      const mockLogin = vi.fn();
      vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
        login: mockLogin,
        user: null,
      });

      // Instructor logging in with stale from: "/dashboard" (student only)
      authApi.login.mockResolvedValueOnce({
        data: {
          user: { id: 3, name: "Instructor User", role: "instructor" },
          token: "jwt-token",
        },
      });

      let testLocation;
      function LocationWatcher() {
        testLocation = useLocation();
        return null;
      }

      render(
        <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: "/dashboard" } }]}>
          <LocationWatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/instructor-dashboard" element={<div>Instructor Studio</div>} />
            <Route path="/dashboard" element={<div>Student Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/^Email/i), {
        target: { value: "instructor@uptoskills.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        // Must NOT go to /dashboard; must go to /instructor-dashboard
        expect(testLocation.pathname).toBe("/instructor-dashboard");
      });
    });

    it("honors valid from location when role is permitted to open it", async () => {
      const mockLogin = vi.fn();
      vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
        login: mockLogin,
        user: null,
      });

      authApi.login.mockResolvedValueOnce({
        data: {
          user: { id: 3, name: "Instructor User", role: "instructor" },
          token: "jwt-token",
        },
      });

      let testLocation;
      function LocationWatcher() {
        testLocation = useLocation();
        return null;
      }

      render(
        <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: "/courses/react-101" } }]}>
          <LocationWatcher />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/courses/react-101" element={<div>React 101 Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/^Email/i), {
        target: { value: "instructor@uptoskills.com" },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

      await waitFor(() => {
        expect(testLocation.pathname).toBe("/courses/react-101");
      });
    });
  });

  describe("3. PrivateRoute role gating and redirect handling", () => {
    it("Instructor opening /dashboard -> redirected to /instructor-dashboard", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: true,
        user: { role: "instructor" },
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["student"]}>
                  <div>Student Dashboard</div>
                </PrivateRoute>
              }
            />
            <Route path="/instructor-dashboard" element={<div>Instructor Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Instructor Home")).toBeInTheDocument();
      expect(screen.queryByText("Student Dashboard")).not.toBeInTheDocument();
    });

    it("Instructor opening /admin -> redirected to /instructor-dashboard", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: true,
        user: { role: "instructor" },
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={["admin"]}>
                  <div>Admin Panel</div>
                </PrivateRoute>
              }
            />
            <Route path="/instructor-dashboard" element={<div>Instructor Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Instructor Home")).toBeInTheDocument();
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    });

    it("Student opening /admin -> redirected to /dashboard", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: true,
        user: { role: "student" },
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <PrivateRoute roles={["admin"]}>
                  <div>Admin Panel</div>
                </PrivateRoute>
              }
            />
            <Route path="/dashboard" element={<div>Student Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Student Home")).toBeInTheDocument();
      expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    });

    it("Student opening /instructor-dashboard -> redirected to /dashboard", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: true,
        user: { role: "student" },
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/instructor-dashboard"]}>
          <Routes>
            <Route
              path="/instructor-dashboard"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <div>Instructor Studio</div>
                </PrivateRoute>
              }
            />
            <Route path="/dashboard" element={<div>Student Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Student Home")).toBeInTheDocument();
      expect(screen.queryByText("Instructor Studio")).not.toBeInTheDocument();
    });

    it("Admin opening /dashboard -> redirected to /admin", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: true,
        user: { role: "admin" },
        loading: false,
      });

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["student"]}>
                  <div>Student Dashboard</div>
                </PrivateRoute>
              }
            />
            <Route path="/admin" element={<div>Admin Home</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Admin Home")).toBeInTheDocument();
      expect(screen.queryByText("Student Dashboard")).not.toBeInTheDocument();
    });

    it("Logged out user opening protected route -> redirected to /login with location state", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: false,
      });

      let testLocation;
      function LoginView() {
        testLocation = useLocation();
        return <div>Login Screen</div>;
      }

      render(
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <div>Secret Profile</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<LoginView />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText("Login Screen")).toBeInTheDocument();
      expect(screen.queryByText("Secret Profile")).not.toBeInTheDocument();
      expect(testLocation.state?.from?.pathname).toBe("/profile");
    });

    it("renders loading skeleton while auth loading is true without bouncing", () => {
      vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
        isAuthenticated: false,
        user: null,
        loading: true, // Auth verification in progress
      });

      render(
        <MemoryRouter initialEntries={["/instructor-dashboard"]}>
          <Routes>
            <Route
              path="/instructor-dashboard"
              element={
                <PrivateRoute roles={["instructor", "admin"]}>
                  <div>Instructor Content</div>
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Must not redirect to /login while loading is true
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
      expect(screen.queryByText("Instructor Content")).not.toBeInTheDocument();
      // Rendered loading skeleton elements
      expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });
});
