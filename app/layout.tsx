import type { Metadata } from "next";
import localFont from "next/font/local";
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
      <body className={sfPro.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
