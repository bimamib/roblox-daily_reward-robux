"use client";

import { Input, Select, SelectItem, Textarea, Button } from "@heroui/react";
import { submitMapAction } from "@/actions/maps";

export function SubmitMapForm() {
  return (
    <form action={submitMapAction} className="mt-8 space-y-5">
      <Input
        name="name"
        label="Nama map"
        placeholder="Contoh: Arena Login Pass"
        isRequired
      />

      <Input
        name="creatorName"
        label="Creator"
        placeholder="Nama creator Roblox"
        isRequired
      />

      <Input
        name="robloxUrl"
        label="Roblox URL"
        type="url"
        placeholder="https://www.roblox.com/games/..."
        isRequired
      />

      <Select
        name="durationDays"
        label="Durasi absensi"
        placeholder="Pilih durasi"
        isRequired
      >
        <SelectItem key="7">7 Hari</SelectItem>
        <SelectItem key="14">14 Hari</SelectItem>
        <SelectItem key="30">30 Hari</SelectItem>
      </Select>

      <Textarea
        name="description"
        label="Catatan"
        placeholder="Tambahkan informasi mengenai map..."
      />

      <Button type="submit" color="primary" className="skeuo-btn w-full">
        Kirim untuk review
      </Button>
    </form>
  );
}
