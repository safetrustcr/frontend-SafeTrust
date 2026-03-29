/** ISO 4217 codes we format with Intl currency style (e.g. $ for USD). */
const ISO_CURRENCY_CODES = new Set([
  "USD",
  "EUR",
  "GBP",
  "MXN",
  "CRC",
]);

/**
 * Formats a numeric amount with a currency label — avoids `$` + `USDC` mismatch.
 */
export function formatEscrowAmount(amount: number, currency: string): string {
  if (ISO_CURRENCY_CODES.has(currency)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  }
  return `${amount.toLocaleString()} ${currency}`;
}
