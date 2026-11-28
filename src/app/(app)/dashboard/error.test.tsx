import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardErrorBoundary from "./error";

jest.mock("@sentry/nextjs", () => ({ captureException: jest.fn() }));

describe("DashboardErrorBoundary", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv;
    jest.restoreAllMocks();
  });

  it("shows safe production copy, the digest, and both recovery actions", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const reset = jest.fn();
    const error = Object.assign(new Error("private implementation detail"), {
      digest: "ref-123",
    });
    const user = userEvent.setup();

    render(<DashboardErrorBoundary error={error} reset={reset} />);

    const heading = screen.getByRole("heading", {
      name: "This page couldn't load",
    });
    expect(heading).toHaveFocus();
    expect(
      screen.getByText(
        "Something went wrong on our side. Try again, or go back to your dashboard.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("ref-123")).toBeInTheDocument();
    expect(
      screen.queryByText("private implementation detail"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toHaveAttribute("href", "/dashboard/escrow-dashboard");

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("shows the raw error message in development", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV =
      "development";
    const error = new Error("development detail");

    render(<DashboardErrorBoundary error={error} reset={jest.fn()} />);

    expect(screen.getByText("development detail")).toBeInTheDocument();
  });
});
