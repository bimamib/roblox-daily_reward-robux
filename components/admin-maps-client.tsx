"use client";

import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import { approveMapAction, deleteMapAction } from "@/actions/maps";

type MapData = {
  id: string;
  name: string;
  phaseNumber: number;
  durationDays: number;
  status: string;
  rewards: {
    id: string;
    rewardType: string;
    amount: number;
  }[];
};

export function AdminMapsClient({ maps }: { maps: MapData[] }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Maps</h1>
          <p className="text-default-500">
            CRUD map, approval, reward, dan phase.
          </p>
        </div>

        <Link
          href="/admin/maps/new"
          className="skeuo-btn inline-flex items-center justify-center rounded-medium px-4 py-2 font-medium"
        >
          + Map
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {maps.map((map) => {
          const totalRobux = map.rewards
            .filter((reward) => reward.rewardType === "ROBUX")
            .reduce((sum, reward) => sum + reward.amount, 0);

          return (
            <div
              key={map.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-4"
            >
              <div>
                <h2 className="font-black">{map.name}</h2>

                <p className="text-sm text-default-500">
                  Phase {map.phaseNumber} · {map.durationDays} hari ·{" "}
                  {totalRobux} R$
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip>{map.status}</Chip>

                <Link
                  href={`/admin/maps/${map.id}/edit`}
                  className="inline-flex items-center justify-center rounded-medium border border-default-200 px-3 py-1.5 text-sm font-medium"
                >
                  Edit
                </Link>

                {map.status === "PENDING_REVIEW" && (
                  <form action={approveMapAction}>
                    <input type="hidden" name="id" value={map.id} />

                    <Button type="submit" size="sm" variant="secondary">
                      Approve
                    </Button>
                  </form>
                )}

                <form action={deleteMapAction}>
                  <input type="hidden" name="id" value={map.id} />

                  <Button type="submit" size="sm" variant="danger">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
