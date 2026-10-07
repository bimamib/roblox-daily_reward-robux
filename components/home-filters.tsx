"use client";

import { Input, Label, ListBox, Select, TextField } from "@heroui/react";

export function HomeFilters() {
  return (
    <div className="mb-7 grid gap-3 md:grid-cols-[1fr_220px]">
      <TextField name="search">
        <Label>Cari map</Label>
        <Input placeholder="Nama map atau creator" />
      </TextField>

      <Select name="duration" placeholder="Semua durasi">
        <Label>Durasi</Label>

        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox>
            <ListBox.Item id="all" textValue="Semua durasi">
              Semua durasi
            </ListBox.Item>

            <ListBox.Item id="7" textValue="7 Hari">
              7 Hari
            </ListBox.Item>

            <ListBox.Item id="14" textValue="14 Hari">
              14 Hari
            </ListBox.Item>

            <ListBox.Item id="30" textValue="30 Hari">
              30 Hari
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
