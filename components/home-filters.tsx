"use client";

import { Input, Select, SelectItem } from "@heroui/react";

export function HomeFilters() {
  return (
    <div className="mb-7 grid gap-3 md:grid-cols-[1fr_220px]">
      <Input label="Cari map" placeholder="Nama map atau creator" />

      <Select label="Durasi" placeholder="Semua durasi">
        <SelectItem key="7">7 Hari</SelectItem>
        <SelectItem key="14">14 Hari</SelectItem>
        <SelectItem key="30">30 Hari</SelectItem>
      </Select>
    </div>
  );
}
