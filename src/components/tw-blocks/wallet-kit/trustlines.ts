/**
 * Trustlines | Non-Native Tokens from Stellar
 *
 * @description Trustlines are the tokens that are used to pay for the escrow
 * @description The trustlines are filtered by the network
 * @description The trustlines are filtered by the network in the trustlineOptions
 */
export const trustlines = [
  // TESTNET
  {
    name: "USDC",
    address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    decimals: 10000000,
    network: "testnet",
  },
  {
    name: "EURC",
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    decimals: 10000000,
    network: "testnet",
  },
  // MAINNET
  {
    name: "USDC",
    address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    decimals: 10000000,
    network: "mainnet",
  },
  {
    name: "EURC",
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
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
        { value: trustline.address, label: trustline.name },
      ])
  ).values()
);
