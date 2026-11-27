/** Returns an error message, or null when the image URL is acceptable. */
export function validateImageUrl(value: string): string | null {
  const url = value.trim();
  if (!url) return "Image URL is required";
  const isHttps = /^https:\/\/[^\s/]+\S*$/i.test(url);
  const isSiteRelative = /^\/(?!\/)\S*$/.test(url);
  if (!isHttps && !isSiteRelative) return "Enter a valid https:// image URL";
  return null;
}
