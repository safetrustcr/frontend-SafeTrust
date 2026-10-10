import { formatPrice, formatAmount } from "./format";
import { formatListingPrice } from "@/components/listings/formatListingPrice";
import { formatEscrowAmount } from "./formatEscrowAmount";

describe("Money formatters", () => {
  describe("formatPrice", () => {
    it("formats integer amounts as USD with no decimal places", () => {
      expect(formatPrice(4058)).toBe("$4,058");
      expect(formatPrice(0)).toBe("$0");
      expect(formatPrice(1234567)).toBe("$1,234,567");
    });

    it("rounds decimal amounts to the nearest whole dollar", () => {
      expect(formatPrice(4058.4)).toBe("$4,058");
      expect(formatPrice(4058.6)).toBe("$4,059");
    });
  });

  describe("formatAmount", () => {
    it("formats amounts as USD with two decimal places", () => {
      expect(formatAmount(4058)).toBe("$4,058.00");
      expect(formatAmount(0)).toBe("$0.00");
      expect(formatAmount(4058.5)).toBe("$4,058.50");
      expect(formatAmount(4058.99)).toBe("$4,058.99");
    });

    it("formats escrow and warranty deposit amounts with two decimal places", () => {
      const warrantyDeposit = 2400;
      expect(formatAmount(warrantyDeposit)).toBe("$2,400.00");
    });
  });

  describe("formatListingPrice compatibility", () => {
    it("re-exports formatPrice behavior", () => {
      expect(formatListingPrice(4058)).toBe("$4,058");
    });
  });

  describe("formatEscrowAmount delegation", () => {
    it("delegates USD amounts to formatAmount", () => {
      expect(formatEscrowAmount(4058, "USD")).toBe("$4,058.00");
    });
  });
});
