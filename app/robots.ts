import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Halaman pribadi / admin tidak perlu muncul di mesin pencari.
        disallow: ["/admin", "/dashboard", "/auth", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
