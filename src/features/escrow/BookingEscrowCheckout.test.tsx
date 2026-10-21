/* eslint-disable @typescript-eslint/no-require-imports */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  deferred,
  fakes,
  GUEST,
  HOST,
  makeBooking,
  QueryWrapper,
  resetFakes,
  seen,
  setEscrowEnv,
  chain,
} from "@/test/harness/escrow";
import { BookingEscrowCheckout } from "./BookingEscrowCheckout";
import {
  activeBookingKey,
  createIntent,
  saveIntent,
} from "./booking-escrow.machine";
import { PriceCalculator } from "@/components/rooms/booking/PriceCalculator";
import { BookingButton } from "@/components/rooms/booking/BookingButton";
import { formatAmount } from "@/lib/format";

jest.mock(
  "@trustless-work/escrow",
  () => require("@/test/harness/escrow").trustlessWorkModule(),
  { virtual: true },
);
jest.mock("@/components/tw-blocks/wallet-kit/wallet-kit", () =>
  require("@/test/harness/escrow").walletKitModule(),
);
jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    address: require("@/test/harness/escrow").GUEST,
    connect: jest.fn(),
  }),
}));
jest.mock("@/core/store/data", () => ({
  useGlobalAuthenticationStore: () => ({
    address: require("@/test/harness/escrow").GUEST,
  }),
}));

beforeAll(setEscrowEnv);
beforeEach(() => {
  resetFakes();
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

function renderCheckout(
  props: Partial<React.ComponentProps<typeof BookingEscrowCheckout>> = {},
) {
  return render(
    <QueryWrapper>
      <BookingEscrowCheckout
        listingId="1"
        booking={makeBooking()}
        guestAddress={GUEST}
        onConnectWallet={jest.fn()}
        {...props}
      />
    </QueryWrapper>,
  );
}

async function openReview() {
  fireEvent.click(await screen.findByRole("button", { name: /Book Now/ }));
  return screen.findByRole("button", { name: /Confirm and pay/ });
}

it("shows price, taxes, platform fee and total before the first signature", async () => {
  const booking = makeBooking();
  renderCheckout({ booking });

  await openReview();

  expect(screen.getByTestId("breakdown-price")).toHaveTextContent(
    `$${booking.price.subtotal.toFixed(2)}`,
  );
  expect(screen.getByTestId("breakdown-tax")).toHaveTextContent(
    `$${booking.price.tax.toFixed(2)}`,
  );
  expect(screen.getByTestId("breakdown-platform-fee")).toHaveTextContent(
    `$${booking.price.platformFee.toFixed(2)}`,
  );
  expect(screen.getByTestId("escrow-total")).toHaveTextContent(
    `$${booking.price.total.toFixed(2)}`,
  );
  expect(fakes.signTransaction).not.toHaveBeenCalled();
});

it("requires a Stellar public key before showing booking actions", async () => {
  const onConnectWallet = jest.fn();
  renderCheckout({ guestAddress: "0x1234567890abcdef", onConnectWallet });

  const connectButton = await screen.findByRole("button", {
    name: /Connect a Stellar wallet to Book/,
  });
  fireEvent.click(connectButton);

  expect(onConnectWallet).toHaveBeenCalledTimes(1);
  expect(fakes.deployApi).not.toHaveBeenCalled();
  expect(fakes.fundApi).not.toHaveBeenCalled();
});

it("Test 4 (UI): a double click on Confirm starts one deploy", async () => {
  const indexer = deferred<unknown[]>();
  fakes.getEscrowsBySigner.mockImplementationOnce(() => indexer.promise);
  renderCheckout();

  const confirm = await openReview();
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  expect(confirm).toBeDisabled();

  await act(async () => indexer.resolve([]));
  await screen.findByText("Booking confirmed");
  expect(fakes.deployApi).toHaveBeenCalledTimes(1);
});

it("shows step 1 of 2 with Cancel while the wallet prompt is open", async () => {
  const signature = deferred<string>();
  fakes.signTransaction.mockImplementationOnce(() => signature.promise);
  renderCheckout();

  fireEvent.click(await openReview());

  expect(
    await screen.findByText("Confirm in your wallet (step 1 of 2)"),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(
    await screen.findByText(
      "You cancelled the signature. Nothing was charged.",
    ),
  ).toBeInTheDocument();

  await act(async () => signature.reject({ code: -4, message: "closed" }));
  expect(fakes.sendTransaction).not.toHaveBeenCalled();
});

it("Test 3 (UI): a rejected deploy says nothing was charged and keeps the booking", async () => {
  fakes.signTransaction.mockRejectedValueOnce({
    code: -4,
    message: "User declined access",
  });
  const booking = makeBooking();
  renderCheckout({ booking });

  fireEvent.click(await openReview());

  expect(
    await screen.findByText(
      "You cancelled the signature. Nothing was charged.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
  expect(screen.getByTestId("escrow-total")).toHaveTextContent(
    `$${booking.price.total.toFixed(2)}`,
  );
  expect(fakes.sendTransaction).not.toHaveBeenCalled();

  // Manual retry works and still deploys only once.
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("Booking confirmed");
  expect(fakes.deployApi).toHaveBeenCalledTimes(2); // the first build was rejected at signing
  expect(fakes.deployApi.mock.calls[0][0].engagementId).toBe(
    fakes.deployApi.mock.calls[1][0].engagementId,
  );
  expect(chain.escrows).toHaveLength(1);
});

it("reuses the created escrow when funding is retried", async () => {
  fakes.fundApi.mockRejectedValueOnce(new Error("Temporary funding error"));
  renderCheckout();

  fireEvent.click(await openReview());
  fireEvent.click(await screen.findByRole("button", { name: /Try again/ }));

  await screen.findByText("Booking confirmed");
  expect(fakes.deployApi).toHaveBeenCalledTimes(1);
  expect(fakes.fundApi).toHaveBeenCalledTimes(2);
  expect(fakes.fundApi.mock.calls[0][0].contractId).toBe(
    fakes.fundApi.mock.calls[1][0].contractId,
  );
});

it("clears a safely replaceable pending booking when dates change", async () => {
  const firstBooking = makeBooking();
  const changedBooking = makeBooking({
    checkIn: "2030-01-11",
    checkOut: "2030-01-13",
  });
  const { rerender } = renderCheckout({ booking: firstBooking });

  fakes.signTransaction.mockRejectedValueOnce({
    code: -4,
    message: "User declined access",
  });
  fireEvent.click(await openReview());
  await screen.findByRole("button", { name: "Try again" });
  expect(sessionStorage.getItem(activeBookingKey("1"))).not.toBeNull();

  rerender(
    <QueryWrapper>
      <BookingEscrowCheckout
        listingId="1"
        booking={changedBooking}
        guestAddress={GUEST}
        onConnectWallet={jest.fn()}
      />
    </QueryWrapper>,
  );

  await waitFor(() =>
    expect(sessionStorage.getItem(activeBookingKey("1"))).toBeNull(),
  );
  expect(await screen.findByRole("button", { name: /Book Now/ })).toBeEnabled();
});

it("restores 'Confirming on Stellar…' after a refresh and offers no retry", async () => {
  const booking = makeBooking();
  chain.escrows.push({
    engagementId: "b-1",
    contractId: "C1",
    amount: booking.price.total,
    balance: 0,
  });
  saveIntent({
    ...createIntent("b-1", booking),
    signer: GUEST,
    state: {
      step: "fund:submitted",
      contractId: "C1",
      txHash: "deadbeef",
      submittedAt: new Date().toISOString(),
    },
  });
  sessionStorage.setItem(activeBookingKey("1"), "b-1");

  renderCheckout({ booking: null });

  expect(await screen.findByText("Confirming on Stellar…")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /stellar.expert/ })).toHaveAttribute(
    "href",
    "https://stellar.expert/explorer/testnet/tx/deadbeef",
  );
  expect(
    screen.queryByRole("button", { name: /Try again|Check again/ }),
  ).not.toBeInTheDocument();
});

it("a deployed booking offers Fund now, which never redeploys", async () => {
  const booking = makeBooking();
  chain.escrows.push({
    engagementId: "b-2",
    contractId: "C2",
    amount: booking.price.total,
    balance: 0,
  });
  saveIntent({
    ...createIntent("b-2", booking),
    signer: GUEST,
    state: { step: "deployed", contractId: "C2" },
  });
  sessionStorage.setItem(activeBookingKey("1"), "b-2");

  renderCheckout({ booking: null });

  expect(
    await screen.findByText("Escrow created. Fund it to confirm your booking"),
  ).toBeInTheDocument();
  const fundNow = screen.getByRole("button", { name: /Fund now/ });
  // Disabled until the on-mount reconcile has finished.
  await waitFor(() => expect(fundNow).toBeEnabled());
  fireEvent.click(fundNow);

  await screen.findByText("Booking confirmed");
  expect(fakes.deployApi).not.toHaveBeenCalled();
  expect(seen.fund![0]).toMatchObject({
    contractId: "C2",
    amount: booking.price.total,
  });
});

it("requires the original Stellar wallet to fund a restored escrow", async () => {
  const booking = makeBooking();
  const onConnectWallet = jest.fn();
  chain.escrows.push({
    engagementId: "b-restored",
    contractId: "C-restored",
    amount: booking.price.total,
    balance: 0,
  });
  saveIntent({
    ...createIntent("b-restored", booking),
    signer: GUEST,
    state: { step: "deployed", contractId: "C-restored" },
  });
  sessionStorage.setItem(activeBookingKey("1"), "b-restored");

  renderCheckout({
    booking: null,
    guestAddress: HOST,
    onConnectWallet,
  });

  fireEvent.click(
    await screen.findByRole("button", { name: "Reconnect escrow wallet" }),
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    /wallet used to create this escrow/,
  );
  expect(
    screen.queryByRole("button", { name: /Fund now/ }),
  ).not.toBeInTheDocument();
  expect(onConnectWallet).toHaveBeenCalledTimes(1);
  expect(fakes.fundApi).not.toHaveBeenCalled();
});

it("keeps an uncertain deploy recoverable when dates change", async () => {
  const originalBooking = makeBooking();
  const changedBooking = makeBooking({
    checkIn: "2030-01-11",
    checkOut: "2030-01-13",
  });
  saveIntent({
    ...createIntent("b-uncertain", originalBooking),
    signer: GUEST,
    state: {
      step: "failed",
      at: "deploy",
      reason: "network",
      txHash: "uncertain-deploy-tx",
    },
  });
  sessionStorage.setItem(activeBookingKey("1"), "b-uncertain");
  fakes.getEscrowsBySigner.mockRejectedValue(new Error("Indexer unavailable"));
  fakes.txStatusApi.mockResolvedValue({ status: "PENDING" });

  const { rerender } = renderCheckout({ booking: originalBooking });
  await screen.findByRole("button", { name: "Check again" });

  rerender(
    <QueryWrapper>
      <BookingEscrowCheckout
        listingId="1"
        booking={changedBooking}
        guestAddress={GUEST}
        onConnectWallet={jest.fn()}
      />
    </QueryWrapper>,
  );

  await waitFor(() =>
    expect(sessionStorage.getItem(activeBookingKey("1"))).toBe("b-uncertain"),
  );
  expect(
    screen.queryByRole("button", { name: /Book Now/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Start over" }),
  ).not.toBeInTheDocument();
});

it("preserves a deployed escrow when the selected dates change", async () => {
  const originalBooking = makeBooking();
  const changedBooking = makeBooking({
    checkIn: "2030-01-11",
    checkOut: "2030-01-13",
  });
  chain.escrows.push({
    engagementId: "b-deployed",
    contractId: "C3",
    amount: originalBooking.price.total,
    balance: 0,
  });
  saveIntent({
    ...createIntent("b-deployed", originalBooking),
    signer: GUEST,
    state: { step: "deployed", contractId: "C3" },
  });
  sessionStorage.setItem(activeBookingKey("1"), "b-deployed");

  const { rerender } = renderCheckout({ booking: originalBooking });
  const fundNow = await screen.findByRole("button", { name: /Fund now/ });
  await waitFor(() => expect(fundNow).toBeEnabled());

  rerender(
    <QueryWrapper>
      <BookingEscrowCheckout
        listingId="1"
        booking={changedBooking}
        guestAddress={GUEST}
        onConnectWallet={jest.fn()}
      />
    </QueryWrapper>,
  );

  await waitFor(() =>
    expect(sessionStorage.getItem(activeBookingKey("1"))).toBe("b-deployed"),
  );
  expect(screen.getByRole("button", { name: /Fund now/ })).toBeInTheDocument();
  expect(fakes.deployApi).not.toHaveBeenCalled();
});

it("refuses to book a stay whose host has no wallet", async () => {
  renderCheckout({ booking: makeBooking({ hostAddress: "" }) });

  expect(
    await screen.findByRole("button", { name: /Book Now/ }),
  ).toBeDisabled();
  expect(screen.getByRole("alert")).toHaveTextContent(
    /hasn't added a payout wallet/,
  );
  expect(fakes.getEscrowsBySigner).not.toHaveBeenCalled();
});

it("Test 5 (UI): displayed total === deployed amount === funded amount", async () => {
  const from = new Date(2031, 2, 1);
  const to = new Date(2031, 2, 4);
  const listing = {
    id: "1",
    name: "La sabana sur",
    owner: { walletAddress: HOST },
  };

  render(
    <QueryWrapper>
      <PriceCalculator
        basePrice={40.18}
        dateRange={{ from, to }}
        guestCount={2}
      />
      <BookingButton
        listing={listing}
        dateRange={{ from, to }}
        guestCount={2}
        nightlyRate={40.18}
        isAvailable
      />
    </QueryWrapper>,
  );

  const calculatorTotal = screen.getByTestId(
    "price-calculator-total",
  ).textContent;
  fireEvent.click(await openReview());
  const reviewTotal = screen.getByTestId("escrow-total").textContent;
  await screen.findByText("Booking confirmed");

  expect(reviewTotal).toBe(calculatorTotal);
  expect(formatAmount(seen.deploy!.amount as number)).toBe(calculatorTotal);
  expect(seen.fund![0].amount).toBe(seen.deploy!.amount);
  expect(seen.deploy!.platformFee).toBe(
    require("./config").PLATFORM_FEE_PERCENT,
  );
  expect(seen.deploy!.title).toBe("La sabana sur: 3 nights");
});

describe("blocked selection with a restored idle draft", () => {
  function persistIdleDraft() {
    saveIntent({
      ...createIntent("b-idle", makeBooking()),
      signer: GUEST,
      state: { step: "idle" },
    });
    sessionStorage.setItem(activeBookingKey("1"), "b-idle");
  }

  it("still blocks when the guest picks new unavailable dates", async () => {
    persistIdleDraft();
    renderCheckout({
      booking: makeBooking({ checkIn: "2030-02-01", checkOut: "2030-02-03" }),
      blockedReason: "Not Available",
    });

    expect(
      await screen.findByRole("button", { name: "Not Available" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /Book Now|Continue booking/ }),
    ).not.toBeInTheDocument();
  });

  it("lets the guest continue the restored draft when no dates are picked", async () => {
    persistIdleDraft();
    renderCheckout({ booking: null, blockedReason: "Select Dates" });

    const resume = await screen.findByRole("button", {
      name: /Continue booking/,
    });
    await waitFor(() => expect(resume).toBeEnabled());
  });
});
