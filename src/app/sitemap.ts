import type { MetadataRoute } from "next";
import { HELP_TOPICS } from "@/features/help/manifest";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return [
    {
      url: new URL("/help", baseUrl).toString(),
    },
    ...HELP_TOPICS.map(({ slug }) => ({
      url: new URL(`/help/${slug}`, baseUrl).toString(),
    })),
  ];
}
