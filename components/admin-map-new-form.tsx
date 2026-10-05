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

type ParentMap = {
  id: string;
  name: string;
};

export function AdminMapNewForm({ parents }: { parents: ParentMap[] }) {
  return (
    <form action={createMapAdminAction} className="mt-8 space-y-5">
      <TextField name="name" isRequired>
        <Label>Map name</Label>
        <Input />
      </TextField>

      <TextField name="creatorName" isRequired>
        <Label>Creator</Label>
        <Input />
      </TextField>

      <TextField name="robloxUrl" isRequired>
        <Label>Roblox URL</Label>
        <Input />
      </TextField>

      <TextField name="durationDays" isRequired>
        <Label>Duration</Label>
        <Input type="number" placeholder="7 / 14 / 30" />
      </TextField>

      <TextField name="phaseNumber" defaultValue="1" isRequired>
        <Label>Phase number</Label>
        <Input type="number" />
      </TextField>

      <Select name="parentMapId">
        <Label>Parent phase (optional)</Label>

        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover>
          <ListBox>
            <ListBox.Item id="none" textValue="No parent">
              No parent
            </ListBox.Item>

            {parents.map((parent) => (
              <ListBox.Item
                key={parent.id}
                id={parent.id}
                textValue={parent.name}
              >
                {parent.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <Button type="submit" className="skeuo-btn">
        Create map
      </Button>
    </form>
  );
}
