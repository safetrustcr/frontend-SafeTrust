/**
 * Dependency-free StrKey ed25519 public key ("G...") validation.
 *
 * This module must stay free of `@stellar/stellar-sdk`: it backs
 * `src/config/env.ts`, which is imported by root-level modules (root layout,
 * error boundaries, Sentry instrumentation, providers). Anything those files
 * reach lands in *every* route's first-load JS and breaks the FE-54 bundle
 * budgets (the SDK alone is ~254 kB gzip).
 *
 * Behaviour mirrors `StrKey.isValidEd25519PublicKey`: RFC-4648 base32 decode of
 * the 56 characters into 35 bytes, version byte 48 ("G"), and a CRC16-XMODEM
 * checksum over the version byte plus key, stored little-endian.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** StrKey version byte for ed25519 public keys (encodes to the "G" prefix). */
const ED25519_PUBLIC_KEY_VERSION_BYTE = 48;

/** 35 decoded bytes: 1 version byte + 32 key bytes + 2 checksum bytes. */
const DECODED_LENGTH = 35;

/** 56 base32 characters, exact fit for 35 bytes (280 bits) with no padding. */
const ENCODED_LENGTH = 56;

/**
 * Decodes unpadded RFC-4648 base32, returning `null` when the input contains
 * characters outside the alphabet or leftover bits that are not zero padding.
 */
function decodeBase32(value: string): number[] | null {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of value) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  // Remaining bits are padding and have to be zero.
  if (bits >= 5 || (buffer & ((1 << bits) - 1)) !== 0) return null;

  return bytes;
}

/** CRC16-XMODEM (poly 0x1021, init 0x0000) as computed by stellar-base. */
function crc16Xmodem(bytes: number[]): number {
  let crc = 0x0000;

  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc;
}

export function isValidEd25519PublicKey(value: string): boolean {
  if (value.length !== ENCODED_LENGTH || value[0] !== "G") return false;

  const decoded = decodeBase32(value);
  if (!decoded || decoded.length !== DECODED_LENGTH) return false;

  if (decoded[0] !== ED25519_PUBLIC_KEY_VERSION_BYTE) return false;

  // The checksum covers the version byte and the key, excluding itself.
  const crc = crc16Xmodem(decoded.slice(0, 33));

  return (
    decoded[33] === (crc & 0xff) && decoded[34] === ((crc >> 8) & 0xff)
  );
}
