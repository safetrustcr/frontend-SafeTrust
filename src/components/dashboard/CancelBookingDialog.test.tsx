import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { toast } from "sonner";
import { CancelBookingDialog } from "./CancelBookingDialog";
import { ApiError, cancelBooking } from "@/features/bookings";
import type { EscrowData } from "@/types/dashboard";

jest.mock("sonner", () => ({ toast: { success: jest.fn() } }));
jest.mock("@/features/bookings", () => {
  class MockApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  }
  return { ApiError: MockApiError, cancelBooking: jest.fn() };
});

const mockCancel = cancelBooking as jest.Mock;

const escrow: EscrowData = {
  id: "res-1",
  contractId: "",
  status: "pending",
  amount: 450,
  asset: { code: "USDC" },
  metadata: {
    bookingId: "res-1",
    hotelName: "Oceanfront Condo",
    checkInDate: "2026-11-01T00:00:00.000Z",
    checkOutDate: "2026-11-05T00:00:00.000Z",
  },
  allowedActions: ["view", "cancel"],
  marker: "res-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const cancelled: EscrowData = {
  ...escrow,
  status: "cancelled",
  allowedActions: ["view"],
};

function setup() {
  const onClose = jest.fn();
  const onCancelled = jest.fn();
  render(
    <CancelBookingDialog
      escrow={escrow}
      onClose={onClose}
      onCancelled={onCancelled}
    />,
  );
  return { onClose, onCancelled };
}

const confirmButton = () =>
  screen.getByRole("button", { name: /^(cancel booking|cancelling)/i });

describe("CancelBookingDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("describes the booking and the no-funds note", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Cancel booking res-1?" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No funds have been sent yet/)).toBeInTheDocument();
    expect(screen.getByLabelText("Reason (optional)")).toHaveAttribute(
      "maxlength",
      "500",
    );
  });

  it("passes the server row to onCancelled on success", async () => {
    mockCancel.mockResolvedValue(cancelled);
    const { onCancelled, onClose } = setup();
    fireEvent.change(screen.getByLabelText("Reason (optional)"), {
      target: { value: "  plans changed " },
    });
    fireEvent.click(confirmButton());
    await waitFor(() => expect(onCancelled).toHaveBeenCalledWith(cancelled));
    expect(mockCancel).toHaveBeenCalledWith("res-1", "plans changed");
    expect(toast.success).toHaveBeenCalledWith("Booking cancelled");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the refund or dispute message on 409", async () => {
    mockCancel.mockRejectedValue(
      new ApiError("x", 409, "RESERVATION_NOT_CANCELLABLE"),
    );
    const { onCancelled } = setup();
    fireEvent.click(confirmButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This booking can no longer be cancelled. It's already funded; request a refund or open a dispute instead.",
    );
    expect(onCancelled).not.toHaveBeenCalled();
  });

  it("shows a generic message on network error and retries", async () => {
    mockCancel.mockRejectedValueOnce(new ApiError("Network error", 0));
    const { onCancelled } = setup();
    fireEvent.click(confirmButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't cancel the booking. Check your connection and try again.",
    );

    mockCancel.mockResolvedValueOnce(cancelled);
    fireEvent.click(confirmButton());
    await waitFor(() => expect(onCancelled).toHaveBeenCalledWith(cancelled));
    expect(mockCancel).toHaveBeenCalledTimes(2);
  });

  it("does not suggest a retry when the response is invalid", async () => {
    mockCancel.mockRejectedValue(new ApiError("x", 200, "INVALID_RESPONSE"));
    setup();
    fireEvent.click(confirmButton());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't confirm the cancellation. Refresh to see the booking's current status.",
    );
  });

  it("stays open on Escape while pending and disables the button", async () => {
    let resolve!: (row: EscrowData) => void;
    mockCancel.mockReturnValue(
      new Promise<EscrowData>((r) => {
        resolve = r;
      }),
    );
    const { onClose, onCancelled } = setup();
    fireEvent.click(confirmButton());

    const pendingButton = await screen.findByRole("button", {
      name: "Cancelling…",
    });
    expect(pendingButton).toBeDisabled();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onCancelled).not.toHaveBeenCalled();

    await act(async () => resolve(cancelled));
    await waitFor(() => expect(onCancelled).toHaveBeenCalledWith(cancelled));
  });

  it("ignores an outside pointer-down while pending", async () => {
    mockCancel.mockReturnValue(new Promise(() => {}));
    const { onClose } = setup();
    fireEvent.click(confirmButton());
    await screen.findByRole("button", { name: "Cancelling…" });

    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("disables confirm and explains when the booking has no id", () => {
    render(
      <CancelBookingDialog
        escrow={{ ...escrow, metadata: undefined }}
        onClose={jest.fn()}
        onCancelled={jest.fn()}
      />,
    );
    expect(confirmButton()).toBeDisabled();
    expect(
      screen.getByRole("heading", { name: "Cancel booking" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/no reference/);
  });

  it("closes on Escape when idle", () => {
    const { onClose } = setup();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
