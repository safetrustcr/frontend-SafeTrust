import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DashboardPageSkeleton } from "./DashboardPageSkeleton";

const count = (container: HTMLElement, attribute: string) =>
  container.querySelectorAll(`[${attribute}]`).length;

describe("DashboardPageSkeleton", () => {
  it("overview: a busy status with four stat tiles and a table block", () => {
    const { container } = render(
      <DashboardPageSkeleton variant="overview" label="Loading dashboard" />,
    );
    const root = screen.getByRole("status", { name: "Loading dashboard" });
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(count(container, "data-skeleton-tile")).toBe(4);
    expect(count(container, "data-skeleton-row")).toBe(4);
    expect(container.querySelectorAll(".dashboard-glass-card")).toHaveLength(5);
  });

  it("table: a toolbar and six row bars", () => {
    const { container } = render(
      <DashboardPageSkeleton variant="table" label="Loading hotels" />,
    );
    expect(
      screen.getByRole("status", { name: "Loading hotels" }),
    ).toBeInTheDocument();
    expect(count(container, "data-skeleton-row")).toBe(6);
    expect(count(container, "data-skeleton-tile")).toBe(0);
  });

  it("form: five label and input pairs in a narrow column", () => {
    const { container } = render(
      <DashboardPageSkeleton variant="form" label="Loading profile" />,
    );
    expect(
      screen.getByRole("status", { name: "Loading profile" }),
    ).toBeInTheDocument();
    expect(count(container, "data-skeleton-field")).toBe(5);
    expect(container.querySelector(".max-w-2xl")).toBeInTheDocument();
  });

  it("list: eight avatar rows", () => {
    const { container } = render(
      <DashboardPageSkeleton variant="list" label="Loading messages" />,
    );
    expect(
      screen.getByRole("status", { name: "Loading messages" }),
    ).toBeInTheDocument();
    expect(count(container, "data-skeleton-item")).toBe(8);
  });

  it("adds no outer padding, margin or max-width of its own", () => {
    render(<DashboardPageSkeleton variant="overview" label="Loading" />);
    expect(screen.getByRole("status").className).not.toMatch(
      /\b(p[xytblr]?-|m[xytblr]?-|max-w-|mx-auto)/,
    );
  });

  it("only pulses when motion is allowed", () => {
    const { container } = render(
      <DashboardPageSkeleton variant="table" label="Loading" />,
    );
    const skeletons = container.querySelectorAll(".bg-muted");
    expect(skeletons.length).toBeGreaterThan(0);
    for (const skeleton of skeletons) {
      expect(skeleton).toHaveClass("motion-safe:animate-pulse");
      expect(skeleton).not.toHaveClass("animate-pulse");
    }
  });
});
