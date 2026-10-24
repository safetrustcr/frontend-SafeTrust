import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClaimsPanel } from "./ClaimsPanel";
import { ClaimError, submitClaim } from "@/features/escrow/claims";

jest.mock("@/features/escrow/claims", () => {
  const actual = jest.requireActual("@/features/escrow/claims");
  return { ...actual, submitClaim: jest.fn() };
});

jest.mock("@/lib/firebase", () => ({ auth: {} }));

const mockSubmit = submitClaim as jest.MockedFunction<typeof submitClaim>;
const CLAIM = "The fridge was broken at check-in";

const renderPanel = (available = true) =>
  render(
    <ClaimsPanel
      escrowId="esc-1"
      placeholder="Describe the issue"
      available={available}
    />,
  );

const textarea = () =>
  screen.getByRole("textbox", { name: "Describe your claim" });
const sendButton = () =>
  screen.getByRole("button", { name: /^(send|try again|sending…)$/i });

describe("ClaimsPanel", () => {
  let uuid = 0;

  beforeEach(() => {
    mockSubmit.mockReset();
    uuid = 0;
    jest
      .spyOn(crypto, "randomUUID")
      .mockImplementation(
        () =>
          `op-${++uuid}` as `${string}-${string}-${string}-${string}-${string}`,
      );
  });

  it("labels the textarea and links helper text", () => {
    renderPanel();
    expect(textarea()).toHaveAccessibleDescription(
      "At least 10 characters · 0/2000",
    );
  });

  it("Clear empties the draft and is disabled when empty", () => {
    renderPanel();
    const clear = screen.getByRole("button", { name: "Clear" });
    expect(clear).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Clean" })).toBeNull();

    fireEvent.change(textarea(), { target: { value: "Some text" } });
    expect(clear).toBeEnabled();
    fireEvent.click(clear);
    expect(textarea()).toHaveValue("");
    expect(clear).toBeDisabled();
  });

  it("disables Send under 10 characters", () => {
    renderPanel();
    fireEvent.change(textarea(), { target: { value: "too short" } });
    expect(sendButton()).toBeDisabled();
    fireEvent.change(textarea(), { target: { value: "long enough" } });
    expect(sendButton()).toBeEnabled();
  });

  it("sends once while pending and shows a receipt", async () => {
    let resolve!: (value: Awaited<ReturnType<typeof submitClaim>>) => void;
    mockSubmit.mockReturnValue(new Promise((r) => (resolve = r)));
    renderPanel();

    fireEvent.change(textarea(), { target: { value: `  ${CLAIM}  ` } });
    fireEvent.click(sendButton());
    expect(sendButton()).toHaveTextContent("Sending…");
    expect(sendButton()).toBeDisabled();
    fireEvent.click(sendButton());
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith("esc-1", CLAIM, "op-1");

    resolve({
      id: "abcdef1234567890",
      status: "submitted",
      createdAt: "2026-01-01T00:00:00Z",
    });

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Reference abcdef12");
    fireEvent.click(screen.getByRole("button", { name: "Send another claim" }));
    expect(textarea()).toHaveValue("");
  });

  it("keeps the draft on failure and retries with the same op id", async () => {
    mockSubmit.mockRejectedValueOnce(new ClaimError("NETWORK"));
    renderPanel();

    fireEvent.change(textarea(), { target: { value: CLAIM } });
    fireEvent.click(sendButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't reach SafeTrust",
    );
    expect(textarea()).toHaveValue(CLAIM);
    expect(sendButton()).toHaveTextContent("Try again");

    mockSubmit.mockRejectedValueOnce(new ClaimError("RATE_LIMITED"));
    fireEvent.click(sendButton());
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("too many claims"),
    );
    expect(mockSubmit).toHaveBeenNthCalledWith(2, "esc-1", CLAIM, "op-1");

    mockSubmit.mockRejectedValueOnce(new ClaimError("ESCROW_NOT_RELEASED"));
    fireEvent.change(textarea(), { target: { value: `${CLAIM}!` } });
    fireEvent.click(sendButton());
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "once the deposit has been released",
      ),
    );
    expect(mockSubmit).toHaveBeenNthCalledWith(3, "esc-1", `${CLAIM}!`, "op-2");
  });

  it("shows Send as unavailable in demo mode", () => {
    renderPanel(false);
    fireEvent.change(textarea(), { target: { value: CLAIM } });
    expect(sendButton()).toBeDisabled();
    expect(
      screen.getByText(
        "Sending claims isn't available yet in this environment.",
      ),
    ).toBeInTheDocument();
    fireEvent.click(sendButton());
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("warns before leaving with an unsent draft", () => {
    renderPanel();
    const unsent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unsent);
    expect(unsent.defaultPrevented).toBe(false);

    fireEvent.change(textarea(), { target: { value: CLAIM } });
    const withDraft = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(withDraft);
    expect(withDraft.defaultPrevented).toBe(true);
  });
});
