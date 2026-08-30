import { expect, test } from "@playwright/test";
import { join } from "node:path";

test("production project routes are direct, complete, and console-clean", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  const response = await page.goto("/projects");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".project-card")).toHaveCount(22);
  await expect(page.getByRole("link", { name: "Open Pane Skill project page" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Playlist AI project page" })).toBeVisible();
  await page.goto("/projects/parley");
  await expect(page.getByRole("heading", { level: 1, name: "Parley" })).toBeVisible();
  await page.goto("/projects/agent-console");
  await expect(page.getByText("Representative local demo.")).toBeVisible();
  expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
});

test("production gates private routes", async ({ page }) => {
  expect((await page.goto("/about"))?.status()).toBe(404);
  expect((await page.goto("/lab"))?.status()).toBe(404);
});

test("warm theme changes real surfaces and persists through navigation", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("body").evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }));
  await page.locator('.theme-toggle:visible').click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  const warm = await page.locator("body").evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color, scheme: getComputedStyle(document.documentElement).colorScheme }));
  expect(warm).not.toEqual(before);
  expect(warm.scheme).toContain("light");
  expect(await page.locator('meta[name="theme-color"]').getAttribute("content")).toBe("#f1eadf");
  await page.goto("/projects/parley");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  await expect(page.locator('.theme-toggle:visible')).toHaveAccessibleName("Switch to dark theme");
});

test("mobile project atlas does not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only invariant");
  await page.goto("/projects");
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  await page.getByRole("link", { name: "Open Agent Console project page" }).click();
  await expect(page).toHaveURL(/\/projects\/agent-console$/);
});

test.describe("reduced motion", () => {
  test("leaves no meaningful CSS animation running", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects");
    const offenders = await page.locator("*").evaluateAll((elements) => elements.flatMap((element) => {
      const style = getComputedStyle(element);
      if (style.animationName === "none") return [];
      const maxDuration = Math.max(...style.animationDuration.split(",").map((value) => parseFloat(value) * (value.includes("ms") ? 1 : 1000)));
      return maxDuration > 10 ? [`${element.tagName}.${element.className}:${style.animationName}:${style.animationDuration}`] : [];
    }));
    expect(offenders).toEqual([]);
  });
});

test("capture production review artifacts", async ({ page }, testInfo) => {
  const root = join(process.cwd(), "artifacts", "screenshots");
  const mobile = testInfo.project.name === "mobile";
  await page.goto("/projects");
  await page.screenshot({ path: join(root, `projects-${mobile ? "mobile" : "desktop"}-dark.png`), fullPage: false });
  await page.goto("/projects/agent-console");
  await page.locator(".theme-toggle:visible").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  await page.screenshot({ path: join(root, `agent-console-${mobile ? "mobile" : "desktop"}-warm.png`), fullPage: false });
});
