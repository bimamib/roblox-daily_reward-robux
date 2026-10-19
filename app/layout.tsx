import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <Script id="rbxdaily-theme-init" strategy="beforeInteractive">
          {`try { var savedTheme = localStorage.getItem("rbxdaily-theme"); var initialTheme = savedTheme === "light" ? "light" : "dark"; document.documentElement.classList.toggle("light", initialTheme === "light"); document.documentElement.dataset.theme = initialTheme; document.documentElement.style.colorScheme = initialTheme; } catch (_) {}`}
        </Script>
      </head>
      <body className={sfPro.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
