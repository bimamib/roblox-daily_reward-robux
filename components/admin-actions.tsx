"use client";

import Link from "next/link";
import { Button } from "@heroui/react";

export function AdminActions() {
  return (
    <Link href="/admin/maps">
      <Button className="skeuo-btn">Kelola Maps</Button>
    </Link>
  );
}
