/**
 * Validator for the wallet address
 *
 * @param wallet - The wallet address
 * @returns True if the wallet address is valid, false otherwise
 */
export const isValidWallet = (wallet: string) => {
  if (wallet.length !== 56 || wallet[0] !== "G") {
    return false;
  }

  const base32Regex = /^[A-Z2-7]+$/;
  if (!base32Regex.test(wallet)) {
    return false;
  }

  return true;
};
