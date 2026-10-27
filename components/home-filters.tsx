"use client";

import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import {
  inputClass,
  listBoxClass,
  optionClass,
  popoverClass,
  selectTriggerClass,
  skeuoButton,
} from "@/lib/ui";

interface HomeFiltersProps {
  search?: string;
  duration?: string;
}

const durationOptions = [
  { id: "all", label: "Semua durasi" },
  { id: "7", label: "7 Hari" },
  { id: "14", label: "14 Hari" },
  { id: "30", label: "30 Hari" },
];

export function HomeFilters({ search = "", duration = "" }: HomeFiltersProps) {
  return (
    // md:items-end -> input, select, dan tombol rata di garis bawah.
    // Ketiganya sama tinggi (36px di layar md ke atas, ukuran HeroUI v3), jadi sejajar.
    <form
      method="GET"
      action="/"
      className="mb-7 grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end"
    >
      <TextField name="search" defaultValue={search}>
        <Label>Cari Map</Label>
        <Input className={inputClass} placeholder="Nama map atau creator" />
      </TextField>

      <Select
        name="duration"
        placeholder="Semua durasi"
        defaultSelectedKey={duration || null}
      >
        <Label>Durasi</Label>

        <Select.Trigger className={selectTriggerClass}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover className={popoverClass}>
          <ListBox className={listBoxClass}>
            {durationOptions.map((option) => (
              <ListBox.Item
                key={option.id}
                id={option.id}
                textValue={option.label}
                className={optionClass}
              >
                {option.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Button
        type="submit"
        variant="primary"
        className={`${skeuoButton("primary")} min-w-24`}
      >
        Cari
      </Button>
    </form>
  );
}
