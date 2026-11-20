import {
  computeBookingPrice,
  countNights,
  sameAmount,
  TRUSTLESS_WORK_FEE_RATE,
} from "./pricing";
import { formatAmount } from "@/lib/format";

describe("computeBookingPrice - Issue #756 fee transparency", () => {
  const originalEnv = process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK;

  afterEach(() => {
    process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = originalEnv;
  });

  describe("Example: 2 nights × $86, 10% tax, 5% fee", () => {
    describe("Mainnet (0.3% protocol fee active)", () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = "mainnet";
        jest.resetModules();
      });

      it("Option A (guest pays fee): deposit is grossed up so host receives exactly stay + tax ($189.20)", () => {
        // Re-import to ensure network detection picks up mainnet
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { computeBookingPrice: computeMainnet } = require("./pricing");

        const p = computeMainnet({
          nightlyRate: 86,
          nights: 2,
          guests: 1,
          taxRate: 0.1,
          platformFeePercent: 5,
          feeOption: "guest",
        });

        // Stay line: 2 nights × $86 = $172.00
        expect(p.subtotal).toBe(172.0);
        expect(formatAmount(p.subtotal)).toBe("$172.00");

        // Tax line: 10% = $17.20
        expect(p.tax).toBe(17.2);
        expect(formatAmount(p.tax)).toBe("$17.20");

        // Stay + Tax base = $189.20
        const stayPlusTax = p.subtotal + p.tax;
        expect(stayPlusTax).toBe(189.2);

        // Protocol fee is active on mainnet
        expect(p.includesProtocolFee).toBe(true);

        // Locked in escrow: exact integer-cent gross-up = $189.20 / (1 - 0.05 - 0.003) = $199.79
        expect(p.total).toBe(199.79);
        expect(formatAmount(p.total)).toBe("$199.79");

        // Service fee line: gross-up difference ($199.79 - $189.20 = $10.59)
        expect(p.platformFee).toBe(10.59);
        expect(formatAmount(p.platformFee)).toBe("$10.59");

        // Released to host at check-out: exactly stay + tax ($189.20)
        expect(p.hostPayout).toBe(189.2);
        expect(formatAmount(p.hostPayout)).toBe("$189.20");

        // Verify contract deductions at release:
        // Platform fee: 5% of $199.79 = $9.99
        // Protocol fee: 0.3% of $199.79 = $0.60
        // Payout = $199.79 - $9.99 - $0.60 = $189.20
        expect(p.effectivePlatformFee).toBe(9.99);
        expect(p.trustlessWorkFee).toBe(0.6);
        expect(
          Math.round(
            (p.total - p.effectivePlatformFee - p.trustlessWorkFee) * 100,
          ) / 100,
        ).toBe(189.2);
      });

      it("Option B (host pays fee): guest deposits stay + tax ($189.20), host receives $179.17", () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { computeBookingPrice: computeMainnet } = require("./pricing");

        const p = computeMainnet({
          nightlyRate: 86,
          nights: 2,
          guests: 1,
          taxRate: 0.1,
          platformFeePercent: 5,
          feeOption: "host",
        });

        // Stay line: 2 nights × $86 = $172.00
        expect(p.subtotal).toBe(172.0);
        expect(formatAmount(p.subtotal)).toBe("$172.00");

        // Tax line: 10% = $17.20
        expect(p.tax).toBe(17.2);
        expect(formatAmount(p.tax)).toBe("$17.20");

        // Service fee is 0 for guest in Option B
        expect(p.platformFee).toBe(0);

        // Locked in escrow: exactly stay + tax = $189.20
        expect(p.total).toBe(189.2);
        expect(formatAmount(p.total)).toBe("$189.20");

        // Host payout: 5% SafeTrust fee ($9.46) + 0.3% network fee ($0.57) deducted
        // $189.20 - $9.46 - $0.57 = $179.17
        expect(p.hostPayout).toBe(179.17);
        expect(formatAmount(p.hostPayout)).toBe("$179.17");
        expect(p.effectivePlatformFee).toBe(9.46);
        expect(p.trustlessWorkFee).toBe(0.57);
      });
    });

    describe("Testnet (0.3% protocol fee not active)", () => {
      beforeEach(() => {
        process.env.NEXT_PUBLIC_TRUSTLESS_NETWORK = "testnet";
        jest.resetModules();
      });

      it("Option A on testnet: protocol fee is 0, grossed up by 5% platform fee only", () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { computeBookingPrice: computeTestnet } = require("./pricing");

        const p = computeTestnet({
          nightlyRate: 86,
          nights: 2,
          guests: 1,
          taxRate: 0.1,
          platformFeePercent: 5,
          feeOption: "guest",
        });

        expect(p.includesProtocolFee).toBe(false);
        expect(p.trustlessWorkFee).toBe(0);
        // $189.20 / 0.95 = $199.16
        expect(p.total).toBe(199.16);
        expect(p.platformFee).toBe(9.96);
        expect(p.hostPayout).toBe(189.2);
      });

      it("Option B on testnet: protocol fee is 0, host pays 5% platform fee only", () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { computeBookingPrice: computeTestnet } = require("./pricing");

        const p = computeTestnet({
          nightlyRate: 86,
          nights: 2,
          guests: 1,
          taxRate: 0.1,
          platformFeePercent: 5,
          feeOption: "host",
        });

        expect(p.includesProtocolFee).toBe(false);
        expect(p.trustlessWorkFee).toBe(0);
        expect(p.total).toBe(189.2);
        // $189.20 - 5% ($9.46) = $179.74
        expect(p.hostPayout).toBe(179.74);
      });
    });
  });

  describe("Identical numbers across breakdown, host payout, and popover", () => {
    it("ensures host payout matches release math exactly", () => {
      const p = computeBookingPrice({
        nightlyRate: 120,
        nights: 4,
        guests: 2,
        feeOption: "guest",
      });

      // Guest breakdown total === stay + tax + platformFee
      expect(sameAmount(p.total, p.subtotal + p.tax + p.platformFee)).toBe(
        true,
      );

      // Host payout === stay + tax
      expect(sameAmount(p.hostPayout, p.subtotal + p.tax)).toBe(true);
    });

    it("ensures Option B total equals subtotal + tax", () => {
      const p = computeBookingPrice({
        nightlyRate: 150,
        nights: 3,
        guests: 1,
        feeOption: "host",
      });

      expect(sameAmount(p.total, p.subtotal + p.tax)).toBe(true);
      expect(p.platformFee).toBe(0);
      expect(p.hostPayout).toBeLessThan(p.total);
    });
  });

  describe("Edge cases and utilities", () => {
    it("handles zero tax rate correctly", () => {
      const p = computeBookingPrice({
        nightlyRate: 100,
        nights: 2,
        guests: 1,
        taxRate: 0,
        feeOption: "host",
      });

      expect(p.tax).toBe(0);
      expect(p.subtotal).toBe(200);
      expect(p.total).toBe(200);
    });

    it("counts whole calendar nights regardless of timestamp", () => {
      const inDate = new Date("2026-06-01T15:00:00Z");
      const outDate = new Date("2026-06-05T10:00:00Z");
      expect(countNights(inDate, outDate)).toBe(4);
    });

    it("sameAmount compares at cent precision", () => {
      expect(sameAmount(10.001, 10.0)).toBe(true);
      expect(sameAmount(10.009, 10.01)).toBe(true);
      expect(sameAmount(10.01, 10.02)).toBe(false);
    });

    it("verifies protocol fee constant is 0.003 (0.3%)", () => {
      expect(TRUSTLESS_WORK_FEE_RATE).toBe(0.003);
    });
  });
});
