/**
 * Trustlines | Non-Native Tokens from Stellar
 *
 * @description Trustlines are the tokens that are used to pay for the escrow
 * @description The trustlines are filtered by the network
 * @description The trustlines are filtered by the network in the trustlineOptions
 * 
 * Note: For Soroban contracts, `address` is the contract address (starts with C)
 * For traditional assets, `issuer` is the Stellar account that issues the asset (starts with G)
 */
export const trustlines = [
  // TESTNET
  {
    name: "USDC",
    address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA", // Soroban contract
    issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", // USDC issuer on testnet
    decimals: 10000000,
    network: "testnet",
  },
  {
    name: "EURC",
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    issuer: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO", // Same as address for traditional assets
    decimals: 10000000,
    network: "testnet",
  },
  // MAINNET
  {
    name: "USDC",
    address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75", // Soroban contract
    issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", // USDC issuer on mainnet
    decimals: 10000000,
    network: "mainnet",
  },
  {
    name: "EURC",
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    issuer: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    decimals: 10000000,
    network: "mainnet",
  },
];

// TODO: add network dynamic filter
export const trustlineOptions = Array.from(
  new Map(
    trustlines
      .filter((trustline) => trustline.network === "testnet")
      .map((trustline) => [
        trustline.address,
        { 
          value: trustline.address, 
          label: trustline.name,
          issuer: trustline.issuer,
        },
      ])
  ).values()
);
