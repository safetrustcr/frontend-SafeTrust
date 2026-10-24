import { StrKey } from "@stellar/stellar-sdk";
import { isValidEd25519PublicKey } from "./strkey";

const VALID_ADDRESS = "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";
const FORMATED_BUT_BAD_CHECKSUM =
  "GA2H7TG4ND7IZ7DYDYI5PP5R7Q7J5N6XDF2R2G4O5Y3G4N6O5Y3G4N6O";

describe("isValidEd25519PublicKey", () => {
  it("accepts a real account address and rejects malformed ones", () => {
    expect(isValidEd25519PublicKey(VALID_ADDRESS)).toBe(true);
    expect(isValidEd25519PublicKey(FORMATED_BUT_BAD_CHECKSUM)).toBe(false);
    expect(isValidEd25519PublicKey("0x1234567890abcdef")).toBe(false);
    expect(isValidEd25519PublicKey("not-a-key")).toBe(false);
    expect(isValidEd25519PublicKey("")).toBe(false);
    // Secret seeds ("S...") are not public keys.
    expect(
      isValidEd25519PublicKey(
        "SBWRLTGUWJZC6CQTHUEGVAHS7LZNHJHINBG743BZYUOOGZCKBSIKHPIU",
      ),
    ).toBe(false);
  });

  it("rejects truncated and lowercase variants", () => {
    expect(isValidEd25519PublicKey(VALID_ADDRESS.slice(0, 55))).toBe(false);
    expect(isValidEd25519PublicKey(VALID_ADDRESS.toLowerCase())).toBe(false);
  });

  /**
   * The hand-rolled checksum must stay behaviourally identical to the SDK it
   * replaced, otherwise env validation silently diverges from on-chain checks.
   */
  it("stays in sync with StrKey.isValidEd25519PublicKey", () => {
    const cases = [VALID_ADDRESS, FORMATED_BUT_BAD_CHECKSUM];

    // Every single-character mutation of a valid key flips the checksum.
    for (let index = 1; index < VALID_ADDRESS.length; index += 1) {
      cases.push(
        `${VALID_ADDRESS.slice(0, index)}Q${VALID_ADDRESS.slice(index + 1)}`,
      );
    }

    // Random base32 strings of the right length decode but never match.
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    for (let i = 0; i < 500; i += 1) {
      let candidate = "G";
      for (let j = 0; j < 55; j += 1) {
        candidate += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      cases.push(candidate);
    }

    for (const value of cases) {
      expect(isValidEd25519PublicKey(value)).toBe(
        StrKey.isValidEd25519PublicKey(value),
      );
    }
  });
});
