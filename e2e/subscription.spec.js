import { test, expect } from "@playwright/test";

test.describe("Free vs Paid Courses & Demo Subscription E2E Flow", () => {
  test("User logs in, views paid course, subscribes with demo payment, and unlocks course lessons", async ({ page }) => {
    // 1. Visit Login page
    await page.goto("/login");

    // 2. Log in with student credentials
    await page.fill('input[type="email"]', "student@uptoskills.com");
    await page.fill('input[type="password"]', "student123");
    await page.click('button[type="submit"]');

    // 3. Wait for navigation to dashboard or courses
    await page.waitForURL(/\/(dashboard|courses)?/);

    // 4. Navigate to Courses catalog
    await page.goto("/courses");
    await expect(page.locator("h1")).toContainText(/Course Catalog|Explore Courses/i);

    // 5. Verify presence of both FREE badge and paid courses with Subscribe price button
    const freeBadge = page.locator("text=FREE").first();
    await expect(freeBadge).toBeVisible();

    // 6. Find a paid course card and click the subscribe price button
    const subscribePriceBtn = page.locator('button:has-text("Subscribe")').first();
    await expect(subscribePriceBtn).toBeVisible();
    await subscribePriceBtn.click();

    // 7. Verify navigation to /subscribe?course=...
    await page.waitForURL(/\/subscribe\?course=/);
    await expect(page.locator("text=DEMO PAYMENT MODE ACTIVE")).toBeVisible();
    await expect(page.locator("text=Choose Your Learning Plan")).toBeVisible();

    // 8. Click 'Fill Demo Data' to populate demo card credentials
    const fillDemoBtn = page.locator('button:has-text("Fill Demo Data")');
    await expect(fillDemoBtn).toBeVisible();
    await fillDemoBtn.click();

    // 9. Submit Demo Checkout
    const checkoutSubmitBtn = page.locator('button:has-text("Complete Demo Checkout")');
    await expect(checkoutSubmitBtn).toBeVisible();
    await checkoutSubmitBtn.click();

    // 10. Verify Success Screen
    await expect(page.locator("text=Welcome to")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=DEMO-")).toBeVisible();

    // 11. Click 'Start Learning Now' to open unlocked course
    const startLearningBtn = page.locator('button:has-text("Start Learning Now")');
    await expect(startLearningBtn).toBeVisible();
    await startLearningBtn.click();

    // 12. Verify user is on course page and curriculum is accessible (no locked screen)
    await page.waitForURL(/\/courses\//);
    await expect(page.locator("text=This Premium Course is Locked")).not.toBeVisible();
    await expect(page.locator("text=Course Curriculum")).toBeVisible();
  });
});
