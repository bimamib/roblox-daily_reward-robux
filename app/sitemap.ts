import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

// Diperbarui paling lama tiap 1 jam, jadi map baru otomatis masuk sitemap
// tanpa perlu deploy ulang.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
  ];

  try {
    const maps = await prisma.map.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    for (const map of maps) {
      entries.push({
        url: `${base}/maps/${map.slug}`,
        lastModified: map.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    // Jika database tidak terjangkau saat build, sitemap tetap berisi beranda.
    console.error("SITEMAP ERROR:", error);
  }

  return entries;
}
