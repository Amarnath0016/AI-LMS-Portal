import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SubscriptionPage from "./SubscriptionPage";
import { CourseCard } from "@/components/ui/CourseCard";
import CourseDetails from "@/pages/Courses/CourseDetails";
import * as AuthContextModule from "@/store/AuthContext";
import * as SubscriptionContextModule from "@/hooks/useSubscription";
import { subscriptionApi, courseApi } from "@/api/endpoints";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/api/endpoints", () => ({
  subscriptionApi: {
    getPlans: vi.fn(),
    checkout: vi.fn(),
    getMySubscriptions: vi.fn(),
  },
  courseApi: {
    getById: vi.fn(),
    getAll: vi.fn(),
  },
  wishlistApi: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    add: vi.fn().mockResolvedValue({ data: { success: true } }),
    remove: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  userApi: {
    getEnrollments: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  },
  mentorApi: {
    getAll: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  },
}));

describe("Free vs Paid Courses & Subscription Tests", () => {
  const freeCourse = {
    id: 1,
    _id: "course-free-1",
    title: "Free Python 101",
    tag: "Programming",
    level: "Beginner",
    league: "Python League",
    accessType: "free",
    price: 0,
    lessons: [{ id: 101, title: "Lesson 1" }],
  };

  const paidCourse = {
    id: 2,
    _id: "course-paid-2",
    title: "Paid Cloud Architecture",
    tag: "Cloud",
    level: "Advanced",
    league: "Cloud League",
    accessType: "paid",
    price: 2999,
    lessons: [{ id: 201, title: "Lesson 1", script: "Secret" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(AuthContextModule, "useAuthContext").mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", name: "Jane Student", email: "jane@uptoskills.com", role: "student" },
    });

    vi.spyOn(SubscriptionContextModule, "useSubscription").mockReturnValue({
      subscriptions: [],
      plans: [],
      loading: false,
      hasAccess: (c) => c?.accessType === "free" || c?.price === 0,
      isSubscribedToCourse: () => false,
      fetchMySubscriptions: vi.fn(),
    });

    subscriptionApi.getPlans.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            _id: "plan-single",
            name: "Single Course Pass",
            price: 999,
            durationDays: 90,
            courseIds: ["course-paid-2"],
            description: "Pass for selected course",
            features: ["Full Access"],
            isActive: true,
          },
          {
            _id: "plan-monthly",
            name: "Pro Monthly",
            price: 1499,
            durationDays: 30,
            courseIds: [],
            description: "All courses monthly",
            features: ["All Courses Access"],
            isActive: true,
          },
        ],
      },
    });

    courseApi.getById.mockImplementation((id) => {
      if (String(id) === "2" || String(id) === "course-paid-2") {
        return Promise.resolve({ data: { success: true, data: paidCourse } });
      }
      return Promise.resolve({ data: { success: true, data: freeCourse } });
    });
  });

  describe("1. CourseCard Badges and Navigation", () => {
    it("renders FREE badge for free courses", () => {
      render(
        <MemoryRouter>
          <CourseCard course={freeCourse} />
        </MemoryRouter>
      );

      expect(screen.getByText("FREE")).toBeInTheDocument();
      expect(screen.queryByText(/Subscribe/i)).not.toBeInTheDocument();
    });

    it("renders price subscribe button for paid courses and navigates on click", async () => {
      render(
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/courses" element={<CourseCard course={paidCourse} />} />
            <Route path="/subscribe" element={<div data-testid="subscribe-page">Subscribe Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      const subscribeBtn = screen.getByRole("button", { name: /₹2,999 - Subscribe/i });
      expect(subscribeBtn).toBeInTheDocument();

      fireEvent.click(subscribeBtn);

      await waitFor(() => {
        expect(screen.getByTestId("subscribe-page")).toBeInTheDocument();
      });
    });

    it("renders Subscribed ✓ badge when user already has an active subscription", () => {
      vi.spyOn(SubscriptionContextModule, "useSubscription").mockReturnValue({
        subscriptions: [{ courseIds: ["course-paid-2"], status: "active" }],
        plans: [],
        loading: false,
        hasAccess: () => true,
        isSubscribedToCourse: () => true,
        fetchMySubscriptions: vi.fn(),
      });

      render(
        <MemoryRouter>
          <CourseCard course={paidCourse} />
        </MemoryRouter>
      );

      expect(screen.getByText(/Subscribed ✓/i)).toBeInTheDocument();
    });
  });

  describe("2. Subscription Page & Demo Checkout Flow", () => {
    it("renders plans, selected course banner, and DEMO MODE banner", async () => {
      render(
        <MemoryRouter initialEntries={["/subscribe?course=2"]}>
          <Routes>
            <Route path="/subscribe" element={<SubscriptionPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify Demo Mode banner
      expect(screen.getByText(/DEMO PAYMENT MODE ACTIVE/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Fill Demo Data/i })).toBeInTheDocument();

      // Verify Plans
      await waitFor(() => {
        expect(screen.getByText("Single Course Pass")).toBeInTheDocument();
        expect(screen.getByText("Pro Monthly")).toBeInTheDocument();
      });

      // Verify Target Course Banner
      await waitFor(() => {
        expect(screen.getByText(/Unlocking Course/i)).toBeInTheDocument();
        expect(screen.getByText("Paid Cloud Architecture")).toBeInTheDocument();
      });
    });

    it("autofills demo card data when clicking 'Fill Demo Data' button", async () => {
      render(
        <MemoryRouter initialEntries={["/subscribe?course=2"]}>
          <Routes>
            <Route path="/subscribe" element={<SubscriptionPage />} />
          </Routes>
        </MemoryRouter>
      );

      const autofillBtn = screen.getByRole("button", { name: /Fill Demo Data/i });
      fireEvent.click(autofillBtn);

      const cardInput = screen.getByLabelText(/Card Number/i);
      expect(cardInput.value).toBe("4242 •••• •••• 4242");
    });

    it("submits demo checkout and renders success screen with plan validity and unlock details", async () => {
      subscriptionApi.checkout.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            _id: "sub-999",
            status: "active",
            demoReference: "DEMO-ABCD1234EFGH",
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
            billingName: "Jane Student",
            billingEmail: "jane@uptoskills.com",
          },
        },
      });

      render(
        <MemoryRouter initialEntries={["/subscribe?course=2"]}>
          <Routes>
            <Route path="/subscribe" element={<SubscriptionPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Autofill data
      fireEvent.click(screen.getByRole("button", { name: /Fill Demo Data/i }));

      // Submit checkout form
      const submitBtn = screen.getByRole("button", { name: /Complete Demo Checkout/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Welcome to Single Course Pass!/i)).toBeInTheDocument();
        expect(screen.getByText("DEMO-ABCD1234EFGH")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Start Learning Now/i })).toBeInTheDocument();
      });
    });
  });

  describe("3. Locked Course Screen in CourseDetails", () => {
    it("shows locked course hero banner and 'Subscribe to Unlock' button for paid course without access", async () => {
      render(
        <MemoryRouter initialEntries={["/courses/2"]}>
          <Routes>
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/subscribe" element={<div data-testid="subscribe-target">Subscribe Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/This Premium Course is Locked/i)).toBeInTheDocument();
        const unlockButtons = screen.getAllByRole("button", { name: /Subscribe to Unlock/i });
        expect(unlockButtons.length).toBeGreaterThanOrEqual(1);
      });

      // Clicking Subscribe to Unlock navigates to /subscribe?course=2
      const unlockBtn = screen.getAllByRole("button", { name: /Subscribe to Unlock/i })[0];
      fireEvent.click(unlockBtn);

      await waitFor(() => {
        expect(screen.getByTestId("subscribe-target")).toBeInTheDocument();
      });
    });
  });
});
