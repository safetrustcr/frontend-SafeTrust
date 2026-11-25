import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EscrowTable } from "./EscrowTable";
import type { BookingAction, EscrowData } from "@/types/dashboard";

const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
jest.mock("@/features/bookings", () => ({
  ApiError: class extends Error {},
  cancelBooking: jest.fn(),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn() } }));

const row = (
  status: EscrowData["status"],
  allowedActions?: BookingAction[],
): EscrowData => ({
  id: "res-1",
  contractId: "",
  status,
  amount: 450,
  asset: { code: "USDC" },
  metadata: {
    bookingId: "res-1",
    hotelName: "Oceanfront Condo",
    checkInDate: "2026-11-01T00:00:00.000Z",
    checkOutDate: "2026-11-05T00:00:00.000Z",
  },
  allowedActions,
  marker: "res-1-marker",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

// ResponsiveTable renders the desktop table first and the mobile cards second.
const DESKTOP = 0;
const MOBILE = 1;

async function openMenu(escrow: EscrowData, layout = DESKTOP) {
  const onRowUpdated = jest.fn();
  render(<EscrowTable escrows={[escrow]} onRowUpdated={onRowUpdated} />);
  const triggers = screen.getAllByRole("button", { name: "Open menu" });
  expect(triggers).toHaveLength(2);
  // jsdom has no layout, so mark only the opened layout's trigger as visible.
  Object.defineProperty(triggers[layout], "offsetParent", {
    configurable: true,
    get: () => document.body,
  });
  fireEvent.keyDown(triggers[layout], { key: "Enter" });
  return { onRowUpdated, trigger: triggers[layout] };
}

describe("EscrowTable actions menu", () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    "pending",
    "funded",
    "check_in_approved",
    "check_out_approved",
    "completed",
    "cancelled",
  ] as const)("never offers Mark as Completed (%s)", async (status) => {
    await openMenu(row(status, ["view", "cancel"]));
    expect(screen.queryByText(/mark as completed/i)).not.toBeInTheDocument();
  });

  it("offers View receipt on a completed row", async () => {
    await openMenu(row("completed", ["view"]));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /view receipt/i }),
    );
    expect(push).toHaveBeenCalledWith("/dashboard/escrow/res-1");
  });

  it("does not offer View receipt on a funded row", async () => {
    await openMenu(row("funded", ["view"]));
    expect(
      screen.queryByRole("menuitem", { name: /view receipt/i }),
    ).not.toBeInTheDocument();
  });

  it("navigates to the contract section from View contract", async () => {
    await openMenu(row("funded", ["view"]));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /view contract/i }),
    );
    expect(push).toHaveBeenCalledWith("/dashboard/escrow/res-1#contract");
  });

  it("formats XLM amounts with XLM code instead of dollar sign", () => {
    const xlmRow: EscrowData = {
      ...row("funded"),
      amount: 100,
      asset: { code: "XLM" },
    };
    render(<EscrowTable escrows={[xlmRow]} />);
    expect(screen.getAllByText("100 XLM")).toHaveLength(2);
    expect(screen.queryByText("$100.00")).not.toBeInTheDocument();
  });

  it("shows Cancel booking when allowedActions includes cancel", async () => {
    await openMenu(row("pending", ["view", "cancel"]));
    expect(
      await screen.findByRole("menuitem", { name: /cancel booking/i }),
    ).toBeInTheDocument();
  });

  it("hides Cancel booking when allowedActions is undefined", async () => {
    await openMenu(row("pending", undefined));
    await screen.findByRole("menuitem", { name: /view contract/i });
    expect(
      screen.queryByRole("menuitem", { name: /cancel booking/i }),
    ).not.toBeInTheDocument();
  });

  it("hides Cancel booking on a funded row with only view", async () => {
    await openMenu(row("funded", ["view"]));
    await screen.findByRole("menuitem", { name: /view contract/i });
    expect(
      screen.queryByRole("menuitem", { name: /cancel booking/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the confirmation dialog from the menu", async () => {
    await openMenu(row("pending", ["view", "cancel"]));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /cancel booking/i }),
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it.each([
    ["desktop", DESKTOP],
    ["mobile", MOBILE],
  ] as const)(
    "leaves the page interactive and returns focus to the visible %s trigger",
    async (_, layout) => {
      const { trigger } = await openMenu(
        row("pending", ["view", "cancel"]),
        layout,
      );
      fireEvent.click(
        await screen.findByRole("menuitem", { name: /cancel booking/i }),
      );
      await screen.findByRole("dialog");
      fireEvent.click(screen.getByRole("button", { name: "Keep booking" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await waitFor(() => {
        expect(document.body.style.pointerEvents).not.toBe("none");
        expect(trigger).toHaveFocus();
      });
    },
  );

  it("renders a card per escrow without checkboxes", () => {
    render(<EscrowTable escrows={[row("funded", ["view"])]} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getAllByText("Oceanfront Condo")).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "View escrow res-1" }),
    ).toHaveLength(2);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("shows the empty message on both layouts", () => {
    render(<EscrowTable escrows={[]} />);
    expect(screen.getAllByText("No escrows found.")).toHaveLength(2);
  });
});
