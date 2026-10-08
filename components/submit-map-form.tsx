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

export function SubmitMapForm() {
  return (
    <form action={submitMapAction} className="mt-8 space-y-5">
      <TextField name="name" isRequired>
        <Label>Nama map</Label>
        <Input placeholder="Contoh: Arena Login Pass" />
      </TextField>

      <TextField name="creatorName" isRequired>
        <Label>Creator</Label>
        <Input placeholder="Nama creator Roblox" />
      </TextField>

      <TextField name="robloxUrl" type="url" isRequired>
        <Label>Roblox URL</Label>
        <Input placeholder="https://www.roblox.com/games/..." />
      </TextField>

      <Select name="durationDays" placeholder="Pilih durasi" isRequired>
        <Label>Durasi absensi</Label>

        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox>
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

      <TextField name="description">
        <Label>Catatan</Label>
        <TextArea placeholder="Tambahkan informasi mengenai map..." />
      </TextField>

      <Button type="submit" variant="primary" className="skeuo-btn w-full">
        Kirim untuk review
      </Button>
    </form>
  );
}
