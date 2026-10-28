"use client";

import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { submitMapAction } from "@/actions/maps";
import {
  inputClass,
  listBoxClass,
  optionClass,
  popoverClass,
  selectTriggerClass,
  skeuoButton,
  textareaClass,
  textareaShellClass,
} from "@/lib/ui";

const durationOptions = [
  { id: "7", label: "7 Hari" },
  { id: "14", label: "14 Hari" },
  { id: "30", label: "30 Hari" },
];

export function SubmitMapForm() {
  return (
    <form action={submitMapAction} className="mt-8 space-y-5">
      <TextField name="name" isRequired>
        <Label>Nama map</Label>
        <Input className={inputClass} placeholder="Contoh: Arena Login Pass" />
      </TextField>

      <TextField name="creatorName" isRequired>
        <Label>Creator</Label>
        <Input className={inputClass} placeholder="Nama creator Roblox" />
      </TextField>

      <TextField name="robloxUrl" type="url" isRequired>
        <Label>Roblox URL</Label>
        <Input
          className={inputClass}
          placeholder="https://www.roblox.com/games/1234567890/Nama-Map"
        />
        <p className="mt-1 text-xs text-[color:var(--text-muted)]">
          Salin link dari halaman game di roblox.com. Link lain akan ditolak.
        </p>
      </TextField>

      <Select name="durationDays" placeholder="Pilih durasi" isRequired>
        <Label>Durasi absensi</Label>

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

      <TextField name="description">
        <Label>Catatan</Label>
        <div className={textareaShellClass}>
          <TextArea
            className={textareaClass}
            placeholder="Tambahkan informasi mengenai map..."
          />
        </div>
      </TextField>

      <Button
        type="submit"
        variant="primary"
        className={`${skeuoButton("primary")} w-full`}
      >
        Tambahkan map
      </Button>
    </form>
  );
}
