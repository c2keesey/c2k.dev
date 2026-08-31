import { expect, test, type Locator } from "@playwright/test";
import { join } from "node:path";
import { instrumentLabels } from "../../components/project-media";
import { projects } from "../../lib/projects";

async function contrastRatio(locator: Locator) {
  return locator.evaluate((element) => {
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
}

async function contrastAgainstThemeSurface(locator: Locator, surface: "--background" | "--card" = "--background") {
  return locator.evaluate((element, surfaceName) => {
    const parse = (value: string) => {
      if (value.startsWith("#")) {
        const hex = value.slice(1);
        const normalized = hex.length === 3 ? [...hex].map((character) => character + character).join("") : hex;
        return [Number.parseInt(normalized.slice(0, 2), 16), Number.parseInt(normalized.slice(2, 4), 16), Number.parseInt(normalized.slice(4, 6), 16), 1];
      }
      const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0, channels[3] ?? 1];
    };
    const composite = (foreground: number[], background: number[]) => {
      const alpha = foreground[3] + background[3] * (1 - foreground[3]);
      return [0, 1, 2].map((index) => (foreground[index] * foreground[3] + background[index] * background[3] * (1 - foreground[3])) / alpha).concat(alpha);
    };
    const luminance = (rgb: number[]) => rgb.slice(0, 3).map((channel) => channel / 255).map((channel) => channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
    const rootStyle = getComputedStyle(document.documentElement);
    const background = parse(rootStyle.getPropertyValue("--background").trim());
    const surfaceColor = surfaceName === "--background" ? background : composite(parse(rootStyle.getPropertyValue(surfaceName).trim()), background);
    const foreground = composite(parse(getComputedStyle(element).color), surfaceColor);
    return (Math.max(luminance(foreground), luminance(surfaceColor)) + .05) / (Math.min(luminance(foreground), luminance(surfaceColor)) + .05);
  }, surface);
}

async function expectMobileTargets(page: import("@playwright/test").Page, label: string) {
  const undersized = await page.locator('a[href], button:not([disabled]), input:not([disabled])').evaluateAll((elements) => elements.flatMap((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) return [];
    return rect.width + .01 < 44 || rect.height + .01 < 44 ? [`${element.tagName.toLowerCase()}.${element.className}:${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`] : [];
  }));
  expect(undersized, `${label} mobile targets`).toEqual([]);
}

async function expectProjectChromeClear(instrument: Locator, label: string, mobile: boolean) {
  const geometry = await instrument.evaluate((element) => {
    const instrumentRect = element.getBoundingClientRect();
    const inspect = (selector: string) => {
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return { display: "missing", position: "missing", overlaps: false };
      const style = getComputedStyle(target);
      const rect = target.getBoundingClientRect();
      const visible = style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
      const overlaps = visible && rect.left < instrumentRect.right && rect.right > instrumentRect.left && rect.top < instrumentRect.bottom && rect.bottom > instrumentRect.top;
      return { display: style.display, position: style.position, overlaps };
    };
    return { nav: inspect(".mobile-nav"), footer: inspect(".status-footer") };
  });
  if (mobile) expect(geometry.nav.display, `${label} mobile nav must be removed from detail layout`).toBe("none");
  expect(geometry.nav.overlaps, `${label} navigation overlap`).toBe(false);
  expect(geometry.footer.position, `${label} footer must remain in document flow`).not.toMatch(/fixed|sticky/);
  expect(geometry.footer.overlaps, `${label} footer overlap`).toBe(false);
}

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

test("production exposes only the intended five API contracts", async ({ request }) => {
  const activity = await request.get("/api/activity");
  expect(activity.status()).toBe(200);
  expect(activity.headers()["cache-control"]).toBe("public, max-age=300");
  expect(await activity.json()).toMatchObject({ repos: expect.any(Array), totalPushes: expect.any(Number), pushesByDay: expect.any(Array) });

  const status = await request.get("/api/status");
  expect(status.status()).toBe(200);
  expect(status.headers()["cache-control"]).toBe("no-cache");
  expect(await status.json()).toMatchObject({ status: expect.stringMatching(/^(online|offline)$/) });

  for (const path of ["/api/feature/current", "/api/feature/accept", "/api/feature/deny"]) {
    const response = path.endsWith("current") ? await request.get(path) : await request.post(path, { data: {} });
    expect(response.status(), path).toBe(404);
    expect(response.headers()["cache-control"], path).toBe("private, no-store");
  }
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
  const warmContrast = await contrastRatio(page.locator(".rail-link.is-active:visible, .mobile-nav-link.is-active:visible"));
  expect(warmContrast).toBeGreaterThanOrEqual(4.5);
  await page.goto("/projects/parley");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  expect(await contrastRatio(page.locator(".project-back-link"))).toBeGreaterThanOrEqual(4.5);
});

test("mobile project atlas does not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only invariant");
  await page.goto("/projects");
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);

  for (let index = 0; index < 4; index++) await page.keyboard.press("Tab");
  for (const project of projects) {
    await page.keyboard.press("Tab");
    await expect.poll(() => page.evaluate(() => {
      const focused = document.activeElement?.getBoundingClientRect();
      const navigation = document.querySelector<HTMLElement>(".mobile-nav")?.getBoundingClientRect();
      return Boolean(document.activeElement?.classList.contains("project-card-link") && focused && navigation && focused.top >= 0 && focused.bottom <= navigation.top - 6);
    }), { message: `${project.slug} keyboard focus must stay above mobile navigation` }).toBe(true);
  }

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
    await expectProjectChromeClear(instrument, `${project.slug} page load`, testInfo.project.name === "mobile");
    const control = page.getByRole("button", { name: instrumentLabels[project.slug as keyof typeof instrumentLabels] });
    await control.scrollIntoViewIfNeeded();
    await expectProjectChromeClear(instrument, `${project.slug} arbitrary scroll`, testInfo.project.name === "mobile");
    const before = await instrument.getAttribute("data-state");
    await control.focus();
    await page.keyboard.press("Enter");
    await expect(instrument).not.toHaveAttribute("data-state", before ?? "");
    await expectProjectChromeClear(instrument, `${project.slug} post-click`, testInfo.project.name === "mobile");

    const geometry = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      focusedBottom: document.activeElement?.getBoundingClientRect().bottom ?? 0,
      viewportHeight: window.innerHeight,
    }));
    expect(geometry.scrollWidth, `${project.slug} horizontal overflow`).toBeLessThanOrEqual(geometry.innerWidth);
    expect(geometry.focusedBottom, `${project.slug} focused control below chrome`).toBeLessThanOrEqual(geometry.viewportHeight - (testInfo.project.name === "mobile" ? 8 : 0));
    if (testInfo.project.name === "mobile") await expectMobileTargets(page, project.slug);
  }

  expect(errors.filter((error) => !error.includes("favicon"))).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test("mobile public pages keep every visible target at least 44 pixels", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only invariant");
  for (const path of ["/", "/projects", "/definitely-missing"]) {
    await page.goto(path);
    await expectMobileTargets(page, path);
  }
});

test("warm and dark project facts meet text contrast minimums", async ({ page }) => {
  for (const theme of ["dark", "warm"] as const) {
    await page.goto("/projects");
    if (theme === "warm") await page.locator(".theme-toggle:visible").click();
    for (const project of projects) {
      await page.goto(`/projects/${project.slug}`);
      for (const selector of [".project-lifecycle", ".project-route", ".stack-list li", ".truth-basis p"]) {
        expect(await contrastAgainstThemeSurface(page.locator(selector).first()), `${theme} ${project.slug} ${selector}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(await contrastAgainstThemeSurface(page.locator(".instrument-header span").first(), "--card"), `${theme} ${project.slug} instrument accent`).toBeGreaterThanOrEqual(4.5);
    }
  }
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
  await page.locator(".theme-toggle:visible").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  await page.goto("/projects/agent-console");
  await page.screenshot({ path: join(root, `agent-console-${mobile ? "mobile" : "desktop"}-warm.png`), fullPage: false });
});

test("capture the rich instrument evidence set", async ({ page }, testInfo) => {
  const root = join(process.cwd(), "artifacts", "screenshots");
  const viewport = testInfo.project.name === "mobile" ? "mobile" : "desktop";
  await page.goto("/projects");
  await page.screenshot({ path: join(root, `rich-atlas-${viewport}-dark.png`), fullPage: true });

  for (const slug of ["maia", "c2k", "flux", "corne", "spotify", "secretgate", "lightning", "agent-console"] as const) {
    if (slug === "agent-console") {
      await page.goto("/projects");
      await page.locator(".theme-toggle:visible").click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
    }
    await page.goto(`/projects/${slug}`);
    const instrument = page.locator(`[data-instrument="${slug}"]`);
    const control = page.getByRole("button", { name: instrumentLabels[slug] });
    await control.focus();
    await page.keyboard.press("Enter");
    await instrument.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await instrument.screenshot({ path: join(root, `rich-${slug}-${viewport}-${slug === "agent-console" ? "warm" : "dark"}.png`) });
  }
});
