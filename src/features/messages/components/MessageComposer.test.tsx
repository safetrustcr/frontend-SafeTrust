import { render, screen, fireEvent } from "@testing-library/react";
import { MessageComposer } from "./MessageComposer";

const toastInfo = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    info: (...args: unknown[]) => toastInfo(...args),
  },
}));

describe("MessageComposer", () => {
  beforeEach(() => {
    toastInfo.mockClear();
  });

  it("sends on enter without shift and labels the demo message", () => {
    const onSend = jest.fn();
    render(<MessageComposer conversationId="conv-1" onSend={onSend} isDemo />);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello John" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    expect(onSend).toHaveBeenCalledWith("Hello John");
    expect(toastInfo).toHaveBeenCalledWith(
      "Sent in demo mode. Not delivered to anyone.",
    );
    expect(input).toHaveValue("");
  });

  it("does not send an empty message", () => {
    const onSend = jest.fn();
    render(<MessageComposer conversationId="conv-1" onSend={onSend} isDemo />);

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
  });
});
