"use client";

import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";

interface HomeFiltersProps {
  search?: string;
  duration?: string;
}

export function HomeFilters({ search = "", duration = "" }: HomeFiltersProps) {
  return (
    // items-end: ketiga kontrol (input, select, tombol) rata di garis bawah.
    // Tinggi input, trigger Select, dan tombol .field-btn sama persis (46px).
    <form
      method="GET"
      action="/"
      className="mb-7 grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end"
    >
      <TextField name="search" defaultValue={search}>
        <Label className="rounded-xl text-foreground">Cari map</Label>

        <Input placeholder="Nama map atau creator" />
      </TextField>

      <Select
        name="duration"
        placeholder="Semua durasi"
        defaultSelectedKey={duration || null}
      >
        <Label className="rounded-xl text-foreground">Durasi</Label>

        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover className="rounded-2xl border border-default-200 bg-content1 p-1 text-foreground shadow-none">
          <ListBox className="rounded-xl bg-content1 p-1 text-foreground">
            <ListBox.Item
              id="all"
              textValue="Semua durasi"
              className="rounded-xl text-foreground"
            >
              Semua durasi
            </ListBox.Item>

            <ListBox.Item
              id="7"
              textValue="7 Hari"
              className="rounded-xl text-foreground"
            >
              7 Hari
            </ListBox.Item>

            <ListBox.Item
              id="14"
              textValue="14 Hari"
              className="rounded-xl text-foreground"
            >
              14 Hari
            </ListBox.Item>

            <ListBox.Item
              id="30"
              textValue="30 Hari"
              className="rounded-xl text-foreground"
            >
              30 Hari
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      <Button type="submit" variant="primary" className="skeuo-btn field-btn">
        Cari
      </Button>
    </form>
  );
}
