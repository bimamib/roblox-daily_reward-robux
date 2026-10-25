"use client";

import { DialogProvider } from "@/components/dialog-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DialogProvider>{children}</DialogProvider>;
}
