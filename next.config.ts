import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
