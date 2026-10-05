"use client";

import { Button, Input, Label, TextField } from "@heroui/react";

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

export function AdminMapEditForm({
  map,
  rewards,
  updateMapAdminAction,
  saveRewardsAction,
}: AdminMapEditFormProps) {
  return (
    <>
      {/* Map Information */}
      <form
        action={updateMapAdminAction}
        className="mt-8 grid gap-4 md:grid-cols-2"
      >
        <input type="hidden" name="id" value={map.id} />

        <TextField name="name">
          <Label>Map name</Label>
          <Input defaultValue={map.name} />
        </TextField>

        <TextField name="creatorName">
          <Label>Creator</Label>
          <Input defaultValue={map.creatorName} />
        </TextField>

        <TextField name="robloxUrl">
          <Label>Roblox URL</Label>
          <Input defaultValue={map.robloxUrl} />
        </TextField>

        <TextField name="durationDays">
          <Label>Duration</Label>
          <Input type="number" defaultValue={String(map.durationDays)} />
        </TextField>

        <TextField name="phaseNumber">
          <Label>Phase</Label>
          <Input type="number" defaultValue={String(map.phaseNumber)} />
        </TextField>

        <div className="md:col-span-2">
          <Button type="submit" className="skeuo-btn">
            Save map
          </Button>
        </div>
      </form>

      {/* Daily Rewards */}
      <form
        action={async (fd) => {
          const rewardsData = Array.from(
            { length: map.durationDays },
            (_, index) => {
              const dayNumber = index + 1;
              const amount = Number(fd.get(`amount-${dayNumber}`) || 0);

              const title = String(
                fd.get(`title-${dayNumber}`) || "Regular Reward",
              );

              return {
                dayNumber,
                amount,
                title,
                rewardType:
                  amount > 0 ? ("ROBUX" as const) : ("OTHER" as const),
              };
            },
          );

          await saveRewardsAction(map.id, rewardsData);
        }}
        className="mt-10 space-y-3"
      >
        <h2 className="text-2xl font-black">Daily Rewards</h2>

        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="grid gap-3 rounded-xl border border-white/10 p-3 md:grid-cols-[90px_1fr_160px]"
          >
            <div className="font-black">Day {reward.dayNumber}</div>

            <TextField name={`title-${reward.dayNumber}`}>
              <Label>Title</Label>
              <Input defaultValue={reward.title ?? "Regular Reward"} />
            </TextField>

            <TextField name={`amount-${reward.dayNumber}`}>
              <Label>Robux</Label>
              <Input type="number" defaultValue={String(reward.amount)} />
            </TextField>
          </div>
        ))}

        <Button type="submit" className="skeuo-btn">
          Save rewards
        </Button>
      </form>
    </>
  );
}
