import type { NextConfig } from "next";
import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";
const isPreview =
  process.env.VERCEL_ENV === "preview" ||
  process.env.CSP_REPORT_ONLY === "true";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://stellar.creit.tech https://api.qrserver.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org https://unpkg.com",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com",
    "https://*.trustlesswork.com",
    "https://horizon-testnet.stellar.org https://horizon.stellar.org https://soroban-testnet.stellar.org",
    process.env.NEXT_PUBLIC_SENTRY_DSN ? "https://*.ingest.sentry.io" : "",
  ].join(" "),
  `frame-src https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "*.firebaseapp.com"} https://accounts.google.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Security headers for web authentication and CSP hardening
  {
    key: isPreview
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy",
    value: csp,
  },
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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "stellar.creit.tech" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
      { protocol: "https", hostname: "unpkg.com" },
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
    ];
  },
};

const sentryOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default process.env.NODE_ENV === "test"
  ? nextConfig
  : (
      Sentry as unknown as {
        withSentryConfig: (
          config: typeof nextConfig,
          options: typeof sentryOptions,
        ) => unknown;
      }
    ).withSentryConfig(nextConfig, sentryOptions);
