import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
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

export default withBundleAnalyzer(nextConfig);
