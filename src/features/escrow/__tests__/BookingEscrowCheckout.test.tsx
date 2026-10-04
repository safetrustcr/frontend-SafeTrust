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
} from "../testing/escrow-harness";
import { BookingEscrowCheckout } from "../BookingEscrowCheckout";
import {
  activeBookingKey,
  createIntent,
  saveIntent,
} from "../booking-escrow.machine";
import { PriceCalculator } from "@/components/rooms/booking/PriceCalculator";
import { BookingButton } from "@/components/rooms/booking/BookingButton";
import { formatAmount } from "@/lib/format";

jest.mock(
  "@trustless-work/escrow",
  () => require("../testing/escrow-harness").trustlessWorkModule(),
  { virtual: true },
);
jest.mock("@/components/tw-blocks/wallet-kit/wallet-kit", () =>
  require("../testing/escrow-harness").walletKitModule(),
);
jest.mock("@/components/auth/wallet/hooks/wallet.hook", () => ({
  useWallet: () => ({ handleConnect: jest.fn() }),
}));
jest.mock("@/core/store/data", () => ({
  useGlobalAuthenticationStore: () => ({
    address: require("../testing/escrow-harness").GUEST,
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
  expect(chain.escrows).toHaveLength(1);
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
    require("../config").PLATFORM_FEE_PERCENT,
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
