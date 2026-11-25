const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/** Listing prices: "$4,058". */
export const formatPrice = (amount: number) => usd.format(amount);

/** Escrow and invoice amounts: "$4,058.00". */
export const formatAmount = (amount: number) => usdCents.format(amount);

/** ISO 4217 codes we format with Intl currency style (e.g. $ for USD). */
const ISO_CURRENCY_CODES = new Set(["USD", "EUR", "GBP", "MXN", "CRC"]);

/**
 * Formats a numeric amount with a currency label - avoids `$` + `USDC` mismatch.
 */
export function formatEscrowAmount(
  amount: number,
  currency: string = "USD",
): string {
  if (currency === "USD") {
    return formatAmount(amount);
  }
  if (ISO_CURRENCY_CODES.has(currency)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
  return `${amount.toLocaleString("en-US")} ${currency}`;
}
