import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Providers } from "@/components/providers";
import { AppShell, type Viewer } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const sfPro = localFont({
  src: "../public/fonts/SF-Pro-Text-Regular.otf",
  weight: "400",
  style: "normal",
  display: "block",
  preload: true,
});

export const metadata: Metadata = {
  title: "RbxDaily — Roblox Reward Tracker",
  description: "Tracker absensi map Roblox dengan reward Robux.",
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
      </head>
      <body className={sfPro.className}>
        <Providers>
          <AppShell viewer={viewer}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
