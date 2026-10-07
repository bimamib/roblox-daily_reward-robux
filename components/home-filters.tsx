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
    <form
      method="GET"
      action="/"
      className="mb-7 grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end"
    >
      <TextField name="search" defaultValue={search}>
        <Label className="text-foreground">Cari map</Label>

        <Input
          placeholder="Nama map atau creator"
          className="text-foreground"
        />
      </TextField>

      <Select
        name="duration"
        placeholder="Semua durasi"
        defaultSelectedKey={duration || null}
      >
        <Label className="text-foreground">Durasi</Label>

        <Select.Trigger className="text-foreground">
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

      <Button type="submit" variant="primary" className="skeuo-btn">
        Cari
      </Button>
    </form>
  );
}
