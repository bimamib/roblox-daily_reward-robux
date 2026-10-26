"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { inputClass, skeuoButton } from "@/lib/ui";

type Reward = {
  id: string;
  dayNumber: number;
  amount: number;
  title: string | null;
};

type AdminMapEditFormProps = {
  map: {
    id: string;
    name: string;
    creatorName: string;
    robloxUrl: string;
    durationDays: number;
    phaseNumber: number;
  };
  rewards: Reward[];
  updateMapAdminAction: (formData: FormData) => Promise<void>;
  saveRewardsAction: (
    mapId: string,
    rewards: {
      dayNumber: number;
      amount: number;
      title: string;
      rewardType: "ROBUX" | "OTHER";
    }[],
  ) => Promise<void>;
};

/**
 * `defaultValue` diberikan ke <TextField>, bukan ke <Input>: TextField sudah
 * mengelola `value` untuk Input di dalamnya (kalau tidak, muncul error
 * "both value and defaultValue" dan kolom tampil kosong).
 */
export function AdminMapEditForm({
  map,
  rewards,
  updateMapAdminAction,
  saveRewardsAction,
}: AdminMapEditFormProps) {
  const rewardByDay = new Map(
    rewards.map((reward) => [reward.dayNumber, reward]),
  );
  const days = Array.from(
    { length: map.durationDays },
    (_, index) => index + 1,
  );

  return (
    <>
      {/* Map Information */}
      <form
        action={updateMapAdminAction}
        className="mt-8 grid gap-4 md:grid-cols-2"
      >
        <input type="hidden" name="id" value={map.id} />

        <TextField name="name" defaultValue={map.name}>
          <Label>Map name</Label>
          <Input className={inputClass} />
        </TextField>

        <TextField name="creatorName" defaultValue={map.creatorName}>
          <Label>Creator</Label>
          <Input className={inputClass} />
        </TextField>

        <TextField name="robloxUrl" defaultValue={map.robloxUrl}>
          <Label>Roblox URL</Label>
          <Input className={inputClass} />
        </TextField>

        <TextField name="durationDays" defaultValue={String(map.durationDays)}>
          <Label>Duration</Label>
          <Input className={inputClass} type="number" />
        </TextField>

        <TextField name="phaseNumber" defaultValue={String(map.phaseNumber)}>
          <Label>Phase</Label>
          <Input className={inputClass} type="number" />
        </TextField>

        <div className="md:col-span-2">
          <Button type="submit" className={skeuoButton("primary")}>
            Save map
          </Button>
        </div>
      </form>

      {/* Daily Rewards */}
      <form
        action={async (fd) => {
          const rewardsData = days.map((dayNumber) => {
            const amount = Number(fd.get(`amount-${dayNumber}`) || 0);

            const title = String(
              fd.get(`title-${dayNumber}`) || "Regular Reward",
            );

            return {
              dayNumber,
              amount,
              title,
              rewardType: amount > 0 ? ("ROBUX" as const) : ("OTHER" as const),
            };
          });

          await saveRewardsAction(map.id, rewardsData);
        }}
        className="mt-10 space-y-3"
      >
        <h2 className="text-2xl font-black">Daily Rewards</h2>

        {days.map((day) => {
          const reward = rewardByDay.get(day);

          return (
            <div
              key={day}
              className="grid gap-3 rounded-xl border border-[color:var(--border)] p-3 md:grid-cols-[90px_1fr_160px]"
            >
              <div className="font-black">Day {day}</div>

              <TextField
                name={`title-${day}`}
                defaultValue={reward?.title ?? "Regular Reward"}
              >
                <Label>Title</Label>
                <Input className={inputClass} />
              </TextField>

              <TextField
                name={`amount-${day}`}
                defaultValue={String(reward?.amount ?? 0)}
              >
                <Label>Robux</Label>
                <Input className={inputClass} type="number" />
              </TextField>
            </div>
          );
        })}

        <Button type="submit" className={skeuoButton("primary")}>
          Save rewards
        </Button>
      </form>
    </>
  );
}
