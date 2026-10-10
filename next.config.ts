import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV !== "production";

// E2E runs a production build over plain http://localhost against the Firebase
// Auth emulator. Real deployments never set this flag (and verifyIdToken only
// honours it for "demo-" projects), so production keeps the strict policy.
const useAuthEmulator = process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === "true";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://stellar.creit.tech https://storage.herewallet.app https://api.qrserver.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com",
    "https://*.trustlesswork.com",
    "https://horizon-testnet.stellar.org https://horizon.stellar.org https://soroban-testnet.stellar.org",
    process.env.NEXT_PUBLIC_SENTRY_DSN ? "https://*.ingest.sentry.io" : "",
    useAuthEmulator ? "http://127.0.0.1:9099 http://localhost:9099" : "",
  ]
    .filter(Boolean)
    .join(" "),
  `frame-src https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`} https://accounts.google.com${useAuthEmulator ? " http://127.0.0.1:9099 http://localhost:9099" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  // Over plain http this rewrites same-origin redirects (e.g. middleware
  // -> /login) to https://localhost and breaks them with ERR_SSL_PROTOCOL_ERROR.
  useAuthEmulator ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Tree-shake barrel-heavy packages so only used icons/fns are bundled.
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "stellar.creit.tech" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${projectId}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/dashboard/hotel", destination: "/hotels", permanent: true },
      {
        source: "/dashboard/hotel/search",
        destination: "/hotels/search",
        permanent: true,
      },
      {
        source: "/dashboard/hotel/details",
        has: [{ type: "query", key: "id", value: "(?<id>.+)" }],
        destination: "/hotels/:id",
        permanent: true,
      },
      {
        source: "/dashboard/hotel/details",
        destination: "/hotels",
        permanent: false,
      },
      {
        source: "/dashboard/hotel/payment",
        has: [{ type: "query", key: "bookingId", value: "(?<bookingId>.+)" }],
        destination: "/hotels?bookingId=:bookingId",
        permanent: false,
      },
      {
        source: "/dashboard/hotel/payment",
        destination: "/hotels",
        permanent: false,
      },
      {
        source: "/dashboard/hotel/create-escrow",
        destination: "/bookings/new/escrow",
        permanent: true,
      },
      {
        source: "/dashboard/hotel/booking/:bookingId/escrow",
        destination: "/bookings/:bookingId/escrow",
        permanent: true,
      },
      {
        source: "/new-password",
        destination: "/reset-password",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
