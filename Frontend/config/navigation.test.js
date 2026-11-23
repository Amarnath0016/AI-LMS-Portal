import { describe, it, expect } from "vitest";
import {
  navigationConfig,
  publicTopNav,
  getNavigationForRole,
  getHomePath,
} from "./navigation";

describe("Navigation Configuration Suite", () => {
  const roles = ["student", "instructor", "admin"];

  it("exports configuration for all three core roles", () => {
    expect(navigationConfig).toHaveProperty("student");
    expect(navigationConfig).toHaveProperty("instructor");
    expect(navigationConfig).toHaveProperty("admin");
  });

  roles.forEach((role) => {
    describe(`Role: ${role}`, () => {
      const config = navigationConfig[role];

      it("has valid homePath, sidebarTitle, sidebarSections, topNav, and mobileNav", () => {
        expect(typeof config.homePath).toBe("string");
        expect(config.homePath.startsWith("/")).toBe(true);
        expect(typeof config.sidebarTitle).toBe("string");
        expect(Array.isArray(config.sidebarSections)).toBe(true);
        expect(config.sidebarSections.length).toBeGreaterThan(0);
        expect(Array.isArray(config.topNav)).toBe(true);
        expect(config.topNav.length).toBeGreaterThan(0);
        expect(Array.isArray(config.mobileNav)).toBe(true);
      });

      it("has exactly 4 mobileNav items with to, label, and icon", () => {
        expect(config.mobileNav).toHaveLength(4);
        config.mobileNav.forEach((item) => {
          expect(item).toHaveProperty("to");
          expect(item).toHaveProperty("label");
          expect(item).toHaveProperty("icon");
          expect(typeof item.to).toBe("string");
          expect(typeof item.label).toBe("string");
          expect(item.icon).toBeDefined();
        });
      });

      it("ensures every sidebar section has a title and valid links with icons", () => {
        config.sidebarSections.forEach((section) => {
          expect(typeof section.title).toBe("string");
          expect(Array.isArray(section.links)).toBe(true);
          expect(section.links.length).toBeGreaterThan(0);
          section.links.forEach((link) => {
            expect(typeof link.to).toBe("string");
            expect(typeof link.label).toBe("string");
            expect(link.icon).toBeDefined();
          });
        });
      });

      it("has no duplicate routes in its sidebar links", () => {
        const allRoutes = config.sidebarSections.flatMap((s) => s.links.map((l) => l.to));
        const uniqueRoutes = new Set(allRoutes);
        expect(uniqueRoutes.size).toBe(allRoutes.length);
      });
    });
  });

  it("returns appropriate homePaths via getHomePath", () => {
    expect(getHomePath("student")).toBe("/dashboard");
    expect(getHomePath("instructor")).toBe("/instructor-dashboard");
    expect(getHomePath("admin")).toBe("/admin");
    expect(getHomePath("unknown")).toBe("/dashboard");
    expect(getHomePath(null)).toBe("/dashboard");
  });

  it("returns appropriate config via getNavigationForRole", () => {
    expect(getNavigationForRole("instructor").sidebarTitle).toBe("Instructor Studio");
    expect(getNavigationForRole("admin").sidebarTitle).toBe("Admin Panel");
    expect(getNavigationForRole("student").sidebarTitle).toBe("Student Hub");
    expect(getNavigationForRole("unknown").sidebarTitle).toBe("Student Hub");
  });

  it("has public topNav with Home and Courses", () => {
    expect(publicTopNav).toEqual([
      { label: "Home", to: "/" },
      { label: "Courses", to: "/courses" },
    ]);
  });
});
