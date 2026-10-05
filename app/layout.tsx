import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

export const metadata = { title: "RbxDaily — Roblox Reward Tracker", description: "Tracker absensi map Roblox dengan reward Robux." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning><body><Providers><Header />{children}</Providers></body></html>;
}
