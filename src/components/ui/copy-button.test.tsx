import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders with default label 'Copy'", () => {
    render(<CopyButton text="sample text" />);
    expect(screen.getByRole("button")).toHaveTextContent("Copy");
  });

  it("renders with custom label", () => {
    render(<CopyButton text="sample text" label="Copy ID" />);
    expect(screen.getByRole("button")).toHaveTextContent("Copy ID");
  });

  it("copies text to clipboard and displays Copied! feedback", async () => {
    render(<CopyButton text="sample text" label="Copy ID" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("sample text");
    expect(screen.getByRole("button")).toHaveTextContent("Copied!");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("button")).toHaveTextContent("Copy ID");
  });

  it("handles clipboard rejection gracefully without crashing", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error("Permission denied")),
      },
    });

    render(<CopyButton text="sample text" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(consoleError).toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveTextContent("Copy");
  });
});
