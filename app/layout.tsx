import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";
import { AppShell, type Viewer } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getSiteUrl, siteConfig } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
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
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  // Kode verifikasi Google Search Console (opsional, diisi lewat env).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

// Dijalankan sinkron di <head> sebelum halaman pertama dicat, sehingga tema
// & status sidebar sudah benar sejak frame pertama (tanpa kilatan gelap/terang).
const themeInitScript = `try { var root = document.documentElement; var savedTheme = localStorage.getItem("rbxdaily-theme"); var initialTheme = savedTheme === "light" ? "light" : "dark"; root.classList.toggle("light", initialTheme === "light"); root.dataset.theme = initialTheme; root.style.colorScheme = initialTheme; root.dataset.sidebar = localStorage.getItem("rbxdaily-sidebar") === "collapsed" ? "collapsed" : "expanded"; } catch (_) { document.documentElement.dataset.sidebar = "expanded"; }`;

// Data terstruktur: membantu Google menampilkan nama situs yang benar.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: ["Rbx Daily", "Roblox Reward Tracker"],
  url: getSiteUrl(),
  inLanguage: "id",
};

async function getViewer(): Promise<Viewer> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let profile: {
    displayName: string | null;
    username: string | null;
    role: "USER" | "ADMIN";
  } | null = null;

  try {
    profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { displayName: true, username: true, role: true },
    });
  } catch (error) {
    console.error("LAYOUT PROFILE ERROR:", error);
  }

  return {
    displayName:
      profile?.displayName ?? profile?.username ?? user.email ?? "Pengguna",
    username: profile?.username ?? null,
    role: profile?.role === "ADMIN" ? "ADMIN" : "USER",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewer();

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          id="rbxdaily-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <AppShell viewer={viewer}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
