import { expect, test } from "@playwright/test";
import { join } from "node:path";
import { instrumentLabels } from "../../components/project-media";
import { projects } from "../../lib/projects";

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
  const warmContrast = await page.locator(".rail-link.is-active:visible, .mobile-nav-link.is-active:visible").evaluate((element) => {
    const parse = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const luminance = (rgb: number[]) => {
      const channels = rgb.map((channel) => { const normalized = channel / 255; return normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4; });
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const style = getComputedStyle(element);
    const foreground = luminance(parse(style.color));
    const background = luminance(parse(style.backgroundColor));
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(warmContrast).toBeGreaterThanOrEqual(4.5);
});

test("mobile project atlas does not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only invariant");
  await page.goto("/projects");
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
  await page.getByRole("link", { name: "Open Agent Console project page" }).click();
  await expect(page).toHaveURL(/\/projects\/agent-console$/);
});

test("every canonical rich route activates its unique instrument without overflow or browser errors", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => {
    if (["image", "script", "stylesheet", "font"].includes(request.resourceType())) failedRequests.push(`${request.method()} ${request.url()}`);
  });

  for (const project of projects) {
    const response = await page.goto(`/projects/${project.slug}`);
    expect(response?.status(), project.slug).toBe(200);
    const instrument = page.locator(`[data-instrument="${project.slug}"]`);
    await expect(instrument).toBeVisible();
    const control = page.getByRole("button", { name: instrumentLabels[project.slug as keyof typeof instrumentLabels] });
    await control.scrollIntoViewIfNeeded();
    const before = await instrument.getAttribute("data-state");
    await control.focus();
    if (testInfo.project.name === "mobile") await expect(page.locator(".mobile-nav")).toHaveCSS("visibility", "hidden");
    await page.keyboard.press("Enter");
    await expect(instrument).not.toHaveAttribute("data-state", before ?? "");

    const geometry = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      focusedBottom: document.activeElement?.getBoundingClientRect().bottom ?? 0,
      viewportHeight: window.innerHeight,
    }));
    expect(geometry.scrollWidth, `${project.slug} horizontal overflow`).toBeLessThanOrEqual(geometry.innerWidth);
    expect(geometry.focusedBottom, `${project.slug} focused control below chrome`).toBeLessThanOrEqual(geometry.viewportHeight - (testInfo.project.name === "mobile" ? 8 : 0));
  }

  expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test("Song Sorter route rejects the conflicting pairwise asset brief", async ({ page }) => {
  await page.goto("/projects/songsorter");
  await expect(page.locator('[data-instrument="songsorter"]')).toContainText("Current track");
  await expect(page.locator('[data-instrument="songsorter"]')).toContainText("Undo");
  await expect(page.locator('[data-instrument="songsorter"]')).not.toContainText(/pairwise/i);
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

test("capture the rich instrument evidence set", async ({ page }, testInfo) => {
  const root = join(process.cwd(), "artifacts", "screenshots");
  const viewport = testInfo.project.name === "mobile" ? "mobile" : "desktop";
  await page.goto("/projects");
  await page.screenshot({ path: join(root, `rich-atlas-${viewport}-dark.png`), fullPage: true });

  for (const slug of ["maia", "flux", "corne", "spotify", "secretgate", "lightning", "agent-console"] as const) {
    await page.goto(`/projects/${slug}`);
    if (slug === "agent-console") {
      await page.locator(".theme-toggle:visible").click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
    }
    const instrument = page.locator(`[data-instrument="${slug}"]`);
    const control = page.getByRole("button", { name: instrumentLabels[slug] });
    await control.focus();
    await page.keyboard.press("Enter");
    await instrument.screenshot({ path: join(root, `rich-${slug}-${viewport}-${slug === "agent-console" ? "warm" : "dark"}.png`) });
  }
});
