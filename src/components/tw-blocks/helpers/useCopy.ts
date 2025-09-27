import { useState } from "react";

/**
 * Use copy to clipboard
 *
 * @returns The copied key id and the function to copy to clipboard
 */
export const useCopy = () => {
  const [copiedKeyId, setCopiedKeyId] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKeyId(true);
    setTimeout(() => setCopiedKeyId(false), 1500);
  };

  return { copiedKeyId, copyToClipboard };
};
