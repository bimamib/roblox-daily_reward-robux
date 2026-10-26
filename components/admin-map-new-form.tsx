"use client";

import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { createMapAdminAction } from "@/actions/admin";
import {
  inputClass,
  listBoxClass,
  optionClass,
  popoverClass,
  selectTriggerClass,
  skeuoButton,
} from "@/lib/ui";

type ParentMap = {
  id: string;
  name: string;
};

export function AdminMapNewForm({ parents }: { parents: ParentMap[] }) {
  return (
    <form action={createMapAdminAction} className="mt-8 space-y-5">
      <TextField name="name" isRequired>
        <Label>Map name</Label>
        <Input className={inputClass} />
      </TextField>

      <TextField name="creatorName" isRequired>
        <Label>Creator</Label>
        <Input className={inputClass} />
      </TextField>

      <TextField name="robloxUrl" isRequired>
        <Label>Roblox URL</Label>
        <Input className={inputClass} />
      </TextField>

      <TextField name="durationDays" isRequired>
        <Label>Duration</Label>
        <Input className={inputClass} type="number" placeholder="7 / 14 / 30" />
      </TextField>

      <TextField name="phaseNumber" defaultValue="1" isRequired>
        <Label>Phase number</Label>
        <Input className={inputClass} type="number" />
      </TextField>

      <Select name="parentMapId">
        <Label>Parent phase (optional)</Label>

        <Select.Trigger className={selectTriggerClass}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover className={popoverClass}>
          <ListBox className={listBoxClass}>
            <ListBox.Item
              id="none"
              textValue="No parent"
              className={optionClass}
            >
              No parent
            </ListBox.Item>

            {parents.map((parent) => (
              <ListBox.Item
                key={parent.id}
                id={parent.id}
                textValue={parent.name}
                className={optionClass}
              >
                {parent.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Button type="submit" className={skeuoButton("primary")}>
        Create map
      </Button>
    </form>
  );
}
