import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "./error";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

describe("Error Component", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders error message and calls reset on button click", () => {
    const mockReset = jest.fn();
    const testError = new Error("Test render error") as Error & { digest?: string };

    render(<ErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
