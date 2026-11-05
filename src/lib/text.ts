/**
 * Normalize user-entered and listing text for accent-insensitive matching:
 * "  San  JOSÉ " → "san jose".
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}
