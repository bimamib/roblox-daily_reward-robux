"use client";

import Link from "next/link";
import { linkButton } from "@/lib/ui";

export function AdminActions() {
  return (
    <>
      <Link href="/admin/maps" className={linkButton("primary")}>
        Kelola Maps
      </Link>

      <Link href="/admin/reports" className={linkButton("secondary")}>
        Laporan
      </Link>
    </>
  );
}
