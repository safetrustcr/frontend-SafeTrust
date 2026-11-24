import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import DashboardErrorBoundary from "./error";

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

describe("DashboardErrorBoundary", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  it("shows a safe production message, an error reference, and recovery actions", () => {
    process.env.NODE_ENV = "production";
    const reset = jest.fn();
    const error = Object.assign(new Error("private implementation detail"), {
      digest: "error-reference-123",
    });

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
    expect(screen.getByText("error-reference-123")).toBeInTheDocument();
    expect(screen.queryByText("private implementation detail")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toHaveAttribute("href", "/dashboard/escrow-dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
