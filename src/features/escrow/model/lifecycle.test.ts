import {
  validateDisputeSplit,
  canPerformAction,
  DISPUTE_REASONS,
} from "./lifecycle";

describe("lifecycle model", () => {
  describe("validateDisputeSplit", () => {
    it("validates exact splits", () => {
      const result = validateDisputeSplit(2500, 1500, 4000);
      expect(result.valid).toBe(true);
      expect(result.difference).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it("validates zero-balance full allocations", () => {
      const fullGuest = validateDisputeSplit(4000, 0, 4000);
      expect(fullGuest.valid).toBe(true);

      const fullHost = validateDisputeSplit(0, 4000, 4000);
      expect(fullHost.valid).toBe(true);
    });

    it("rejects when under-allocated", () => {
      const result = validateDisputeSplit(2000, 1000, 4000);
      expect(result.valid).toBe(false);
      expect(result.difference).toBe(1000);
      expect(result.error).toContain("under the balance");
    });

    it("rejects when over-allocated", () => {
      const result = validateDisputeSplit(2500, 2000, 4000);
      expect(result.valid).toBe(false);
      expect(result.difference).toBe(-500);
      expect(result.error).toContain("over the balance");
    });

    it("rejects negative numbers", () => {
      const result = validateDisputeSplit(-100, 4100, 4000);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Amounts cannot be negative.");
    });

    it("handles decimal precision correctly", () => {
      const result = validateDisputeSplit(1999.99, 2000.01, 4000);
      expect(result.valid).toBe(true);
      expect(result.difference).toBe(0);
    });

    it("rejects NaN inputs", () => {
      const result = validateDisputeSplit(NaN, 2000, 4000);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Please enter valid numeric amounts.");
    });
  });

  describe("canPerformAction", () => {
    it("allows host to mark stay completed only when check-out has passed", () => {
      const beforeCheckout = canPerformAction("host", "funded", {
        isCheckOutPast: false,
      });
      expect(beforeCheckout.canAct).toBe(false);

      const afterCheckout = canPerformAction("host", "funded", {
        isCheckOutPast: true,
      });
      expect(afterCheckout.canAct).toBe(true);
      expect(afterCheckout.actionName).toBe("mark_stay_completed");
    });

    it("allows guest to act when stay is completed", () => {
      const guestOptionB = canPerformAction("guest", "stay_completed", {
        releaseOption: "guest",
      });
      expect(guestOptionB.canAct).toBe(true);
      expect(guestOptionB.actionName).toBe("approve_and_release");

      const guestOptionA = canPerformAction("guest", "stay_completed", {
        releaseOption: "platform",
      });
      expect(guestOptionA.canAct).toBe(true);
      expect(guestOptionA.actionName).toBe("approve_stay");

      const host = canPerformAction("host", "stay_completed");
      expect(host.canAct).toBe(false);
    });

    it("allows platform to release in approved state under Option A", () => {
      const platformA = canPerformAction("platform", "approved", {
        releaseOption: "platform",
      });
      expect(platformA.canAct).toBe(true);
      expect(platformA.actionName).toBe("platform_release");

      const guestA = canPerformAction("guest", "approved", {
        releaseOption: "platform",
      });
      expect(guestA.canAct).toBe(false);
    });

    it("allows resolver to resolve when in disputed state", () => {
      const resolver = canPerformAction("resolver", "disputed");
      expect(resolver.canAct).toBe(true);
      expect(resolver.actionName).toBe("resolve_dispute");

      const guest = canPerformAction("guest", "disputed");
      expect(guest.canAct).toBe(false);

      const host = canPerformAction("host", "disputed");
      expect(host.canAct).toBe(false);
    });
  });

  describe("DISPUTE_REASONS", () => {
    it("has 6 reasons including other", () => {
      expect(DISPUTE_REASONS.length).toBe(6);
      expect(DISPUTE_REASONS.some((r) => r.value === "other")).toBe(true);
    });
  });
});
