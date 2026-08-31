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

  it("materially replaces the c2k panel when the private boundary is selected", () => {
    const project = projects.find(({ slug }) => slug === "c2k")!;
    const { container } = render(<ProjectMedia project={project} />);
    expect(container.textContent).toContain("Private / outside the readout");
    expect(container.textContent).not.toContain("No host panels loaded");
    fireEvent.click(screen.getByRole("button", { name: instrumentLabels.c2k }));
    expect(container.textContent).toContain("Private / withheld by design");
    expect(container.textContent).toContain("No host panels loaded");
    expect(container.textContent).toContain("Machine identity withheld");
    expect(container.querySelector(".network-boundary.private")).toHaveAttribute("data-selected");
  });

  it("renders Agent Console with only explicit representative state", () => {
    const project = projects.find(({ slug }) => slug === "agent-console")!;
    const { container } = render(<ProjectMedia project={project} />);
    expect(container.textContent).toMatch(/representative local demo/i);
    expect(container.textContent).not.toMatch(/localhost|127\.0\.0\.1|100\.\d+|\.ts\.net|token|bearer|session id|machine id/i);
  });

  it("exposes current-step and selectable-control state to assistive technology", () => {
    const propeller = projects.find(({ slug }) => slug === "propeller")!;
    const { unmount } = render(<ProjectMedia project={propeller} />);
    expect(screen.getByRole("listitem", { current: "step" })).toHaveTextContent("Listing found");
    expect(screen.getByRole("button", { name: /Inspect Los Angeles/ })).toHaveAttribute("aria-pressed", "true");
    unmount();

    const songSorter = projects.find(({ slug }) => slug === "songsorter")!;
    render(<ProjectMedia project={songSorter} />);
    expect(screen.getByRole("button", { name: /Warm textures/ })).toHaveAttribute("aria-pressed", "false");
  });
});
