import type { Metadata } from "next";

/** Identitas situs — satu tempat untuk semua metadata SEO. */
export const siteConfig = {
  name: "RbxDaily",
  title: "RbxDaily — Roblox Reward Tracker",
  description:
    "Catat absensi harian map Roblox dengan reward Robux. Cari map 7, 14, atau 30 hari, pantau milestone Robux, dan jangan kehilangan streak lagi.",
  locale: "id_ID",
  /** Gambar pratinjau saat link dibagikan (WhatsApp, Discord, X, dll.). */
  ogImage: "/og-image.png",
} as const;

/**
 * URL dasar situs, dipakai untuk metadataBase, sitemap, dan robots.
 *
 * Urutan:
 *  1. NEXT_PUBLIC_SITE_URL  (isi dengan domain sendiri, mis. https://rbxdaily.com)
 *  2. VERCEL_PROJECT_PRODUCTION_URL (otomatis dari Vercel, tanpa https://)
 *  3. http://localhost:3000 (saat development)
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const raw = explicit || vercel;

  if (!raw) return "http://localhost:3000";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  return withProtocol.replace(/\/+$/, "");
}

/**
 * Metadata lengkap untuk sebuah halaman publik.
 *
 * Catatan: di Next.js, `openGraph` dan `twitter` pada halaman MENGGANTI objek
 * dari layout (bukan digabung), jadi setiap halaman harus memberi lengkap.
 * Fungsi ini memastikan itu selalu terpenuhi.
 */
export function buildMetadata({
  title,
  description,
  path,
}: {
  /** Judul halaman. Kosongkan untuk beranda. */
  title?: string;
  description?: string;
  /** Path kanonik, mis. "/" atau "/maps/nama-map-123". */
  path: string;
}): Metadata {
  const desc = description ?? siteConfig.description;
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;

  return {
    title: title ?? { absolute: siteConfig.title },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      url: path,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [siteConfig.ogImage],
    },
  };
}
