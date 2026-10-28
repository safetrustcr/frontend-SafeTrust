import { clientSchema } from "./client-schema";
import { clientEnv } from "./env";
import { serverEnv, serverSchema } from "./env.server";

describe("Environment Variable Contract", () => {
  const validFirebaseConfig = {
    NEXT_PUBLIC_FIREBASE_API_KEY: "valid-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "safetrustcr-596e3.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "safetrustcr-596e3",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      "safetrustcr-596e3.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "736891312580",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:736891312580:web:2752bc815204c69fcbec91",
  };

  describe("clientSchema", () => {
    it("parses valid full client environment configuration", () => {
      const validStellarAddress =
        "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";
      const parsed = clientSchema.parse({
        ...validFirebaseConfig,
        NEXT_PUBLIC_TRUSTLESS_API_URL: "https://dev.api.trustlesswork.com",
        NEXT_PUBLIC_TRUSTLESS_API_KEY: "my-key",
        NEXT_PUBLIC_TRUSTLESS_NETWORK: "testnet",
        NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: validStellarAddress,
        NEXT_PUBLIC_DISPUTE_RESOLVER_ADDRESS: validStellarAddress,
        NEXT_PUBLIC_USDC_ISSUER: validStellarAddress,
        NEXT_PUBLIC_HASURA_GRAPHQL_URL: "http://localhost:8080/v1/graphql",
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: "wc-project-id",
      });

      expect(parsed.NEXT_PUBLIC_FIREBASE_API_KEY).toBe("valid-api-key");
      expect(parsed.NEXT_PUBLIC_TRUSTLESS_API_URL).toBe(
        "https://dev.api.trustlesswork.com",
      );
      expect(parsed.NEXT_PUBLIC_TRUSTLESS_NETWORK).toBe("testnet");
      expect(parsed.NEXT_PUBLIC_HASURA_GRAPHQL_URL).toBe(
        "http://localhost:8080/v1/graphql",
      );
      expect(parsed.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID).toBe("wc-project-id");
    });

    it("applies defaults for trustless config when optional/undefined", () => {
      const parsed = clientSchema.parse({
        ...validFirebaseConfig,
      });

      expect(parsed.NEXT_PUBLIC_TRUSTLESS_API_URL).toBe(
        "https://dev.api.trustlesswork.com",
      );
      expect(parsed.NEXT_PUBLIC_TRUSTLESS_NETWORK).toBe("testnet");
      expect(parsed.NEXT_PUBLIC_TRUSTLESS_API_KEY).toBe("");
      expect(parsed.NEXT_PUBLIC_HASURA_GRAPHQL_URL).toBe(
        "http://localhost:8080/v1/graphql",
      );
      expect(parsed.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS).toBeUndefined();
      expect(parsed.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID).toBeUndefined();
    });

    it("fails fast with a zod error naming the variable when Firebase API key is missing", () => {
      const configWithoutApiKey = { ...validFirebaseConfig };
      delete (configWithoutApiKey as Record<string, unknown>)
        .NEXT_PUBLIC_FIREBASE_API_KEY;

      const result = clientSchema.safeParse(configWithoutApiKey);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain("NEXT_PUBLIC_FIREBASE_API_KEY");
      }
    });

    it("fails fast when Firebase variables are empty strings", () => {
      const result = clientSchema.safeParse({
        ...validFirebaseConfig,
        NEXT_PUBLIC_FIREBASE_API_KEY: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "NEXT_PUBLIC_FIREBASE_API_KEY",
        );
        expect(issue).toBeDefined();
      }
    });

    it("validates Stellar wallet addresses using StrKey checksum validation", () => {
      const validAddress =
        "GAK6DAPPQDDPSQRXTLWD6SGCOYAXWYP7XKSQNMEIZW6TSW7GKVASZIAH";
      // 56 chars matching regex format but invalid StrKey checksum
      const invalidChecksumAddress =
        "GA2H7TG4ND7IZ7DYDYI5PP5R7Q7J5N6XDF2R2G4O5Y3G4N6O5Y3G4N6O";
      const invalidFormatAddress = "0x1234567890abcdef";

      expect(
        clientSchema.safeParse({
          ...validFirebaseConfig,
          NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: validAddress,
        }).success,
      ).toBe(true);

      expect(
        clientSchema.safeParse({
          ...validFirebaseConfig,
          NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: invalidChecksumAddress,
        }).success,
      ).toBe(false);

      expect(
        clientSchema.safeParse({
          ...validFirebaseConfig,
          NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: invalidFormatAddress,
        }).success,
      ).toBe(false);
    });

    it("lets escrow validation report invalid configured role addresses", () => {
      const originalPlatformAddress =
        process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS;
      process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS = "not-a-key";

      try {
        expect(clientEnv.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS).toBe("not-a-key");
        expect(
          clientSchema.safeParse({
            ...validFirebaseConfig,
            NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: "not-a-key",
          }).success,
        ).toBe(false);
      } finally {
        if (originalPlatformAddress === undefined) {
          delete process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS;
        } else {
          process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS =
            originalPlatformAddress;
        }
      }
    });
  });

  describe("serverSchema", () => {
    const validServerEnv = {
      STELLAR_AUTH_SECRET: `S${"A".repeat(55)}`,
      STELLAR_AUTH_HOME_DOMAIN: "safetrust.example",
      STELLAR_AUTH_WEB_AUTH_DOMAIN: "safetrust.example",
      FIREBASE_ADMIN_CLIENT_EMAIL: "firebase-admin@example.com",
      FIREBASE_ADMIN_PRIVATE_KEY: "test-private-key",
    };
    const environmentKeys = [
      "NODE_ENV",
      "STELLAR_AUTH_SECRET",
      "STELLAR_AUTH_HOME_DOMAIN",
      "STELLAR_AUTH_WEB_AUTH_DOMAIN",
      "SEP10_SIGNING_SECRET",
      "SEP10_HOME_DOMAIN",
      "SEP10_WEB_AUTH_DOMAIN",
    ];
    const originalEnvironment = Object.fromEntries(
      environmentKeys.map((key) => [key, process.env[key]]),
    );

    afterEach(() => {
      for (const [key, value] of Object.entries(originalEnvironment)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      jest.restoreAllMocks();
    });

    it("parses valid BACKEND_URL and allows undefined", () => {
      const withUrl = serverSchema.parse({
        ...validServerEnv,
        BACKEND_URL: "https://api.safetrust.cr",
      });
      expect(withUrl.BACKEND_URL).toBe("https://api.safetrust.cr");

      const withoutUrl = serverSchema.parse(validServerEnv);
      expect(withoutUrl.BACKEND_URL).toBeUndefined();
      expect(withoutUrl.STELLAR_NETWORK).toBe("testnet");
    });

    it("disallows SKIP_AUTH_MIDDLEWARE in production environment", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        "production";

      const parsed = serverSchema.parse({
        ...validServerEnv,
        SKIP_AUTH_MIDDLEWARE: "true",
      });

      expect(parsed.SKIP_AUTH_MIDDLEWARE).toBe(false);
    });

    it("allows SKIP_AUTH_MIDDLEWARE in non-production environments", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        "development";

      const parsed = serverSchema.parse({
        ...validServerEnv,
        SKIP_AUTH_MIDDLEWARE: "true",
      });

      expect(parsed.SKIP_AUTH_MIDDLEWARE).toBe(true);
    });

    it("defaults SKIP_AUTH_MIDDLEWARE to false", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        "development";

      const parsed = serverSchema.parse(validServerEnv);
      expect(parsed.SKIP_AUTH_MIDDLEWARE).toBe(false);
    });

    it("validates the Stellar secret seed and Firebase Admin credentials", () => {
      expect(
        serverSchema.safeParse({
          ...validServerEnv,
          STELLAR_AUTH_SECRET: "not-a-secret-seed",
          FIREBASE_ADMIN_CLIENT_EMAIL: "not-an-email",
        }).success,
      ).toBe(false);
    });

    it("supports legacy SEP-10 variables with one deprecation warning", () => {
      delete process.env.STELLAR_AUTH_SECRET;
      delete process.env.STELLAR_AUTH_HOME_DOMAIN;
      delete process.env.STELLAR_AUTH_WEB_AUTH_DOMAIN;
      process.env.SEP10_SIGNING_SECRET = `S${"B".repeat(55)}`;
      process.env.SEP10_HOME_DOMAIN = "legacy.example";
      process.env.SEP10_WEB_AUTH_DOMAIN = "legacy.example";
      const warning = jest.spyOn(console, "warn").mockImplementation();

      expect(serverEnv.STELLAR_AUTH_SECRET).toBe(`S${"B".repeat(55)}`);
      expect(serverEnv.STELLAR_AUTH_HOME_DOMAIN).toBe("legacy.example");
      expect(serverEnv.STELLAR_AUTH_WEB_AUTH_DOMAIN).toBe("legacy.example");
      expect(warning).toHaveBeenCalledTimes(1);
    });
  });
});
