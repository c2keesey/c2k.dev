import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { instrumentIds, instrumentLabels, ProjectMedia } from "@/components/project-media";
import { projects } from "@/lib/projects";

afterEach(cleanup);

describe("rich project instrument registry", () => {
  it("registers every canonical project once with a unique principal label", () => {
    expect(instrumentIds).toEqual(projects.map(({ slug }) => slug));
    expect(new Set(Object.values(instrumentLabels)).size).toBe(22);
  });

  for (const project of projects) {
    it(`${project.slug} exposes an interactive, labeled, stateful instrument`, () => {
      const { container } = render(<ProjectMedia project={project} />);
      const root = container.querySelector(`[data-instrument="${project.slug}"]`);
      expect(root).toBeInTheDocument();
      expect(root?.querySelector("output")?.textContent).toBeTruthy();

      const control = screen.getByRole("button", { name: instrumentLabels[project.slug as keyof typeof instrumentLabels] });
      expect(control).toBeVisible();
      expect(control.textContent?.trim()).toBeTruthy();
      const before = root?.getAttribute("data-state");
      fireEvent.click(control);
      expect(root?.getAttribute("data-state")).not.toBe(before);
    });
  }

  it("renders Song Sorter without the rejected asset-catalog pairwise claim", () => {
    const project = projects.find(({ slug }) => slug === "songsorter")!;
    const { container } = render(<ProjectMedia project={project} />);
    expect(container.textContent).toMatch(/current track/i);
    expect(container.textContent).toMatch(/undo/i);
    expect(container.textContent).not.toMatch(/pairwise/i);
  });

  it("renders Agent Console with only explicit representative state", () => {
    const project = projects.find(({ slug }) => slug === "agent-console")!;
    const { container } = render(<ProjectMedia project={project} />);
    expect(container.textContent).toMatch(/representative local demo/i);
    expect(container.textContent).not.toMatch(/localhost|127\.0\.0\.1|100\.\d+|\.ts\.net|token|bearer|session id|machine id/i);
  });
});
