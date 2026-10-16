"use client";

import Link from "next/link";
import { Card, Chip } from "@heroui/react";

type MapReward = {
  rewardType: string;
  amount: number;
};

type MapCardData = {
  id: string;
  slug: string;
  name: string;
  creatorName: string;
  durationDays: number;
  verificationStatus: string;
  description?: string | null;
  phaseNumber?: number | null;
  rewards?: MapReward[];
};

export function MapCard({ map }: { map: MapCardData }) {
  const totalRobux = (map.rewards ?? []).reduce(
    (total, reward) =>
      total + (reward.rewardType === "ROBUX" ? reward.amount : 0),
    0,
  );

  return (
    <Link
      href={`/maps/${map.slug}`}
      className="group block min-w-0 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <Card className="h-full min-w-0 border border-default-200/70 bg-content1 transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-400/60 group-hover:shadow-none">
        <Card.Content className="flex h-full min-w-0 flex-col gap-4 p-4 sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 text-sm font-black text-white shadow-md sm:size-14">
              {map.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-base font-black leading-snug sm:text-lg">
                {map.name}
              </h3>
              <p className="mt-1 truncate text-sm text-default-500">
                oleh {map.creatorName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Chip size="sm" variant="soft">
              {map.durationDays} hari
            </Chip>

            <Chip
              size="sm"
              color="success"
              variant="soft"
              className="font-semibold"
            >
              💰 {totalRobux.toLocaleString("id-ID")} Robux
            </Chip>

            <Chip
              size="sm"
              color={
                map.verificationStatus === "VERIFIED" ? "success" : "warning"
              }
              variant="soft"
            >
              {map.verificationStatus === "VERIFIED"
                ? "✓ Verified"
                : "Belum verified"}
            </Chip>
          </div>

          {map.description && (
            <p className="line-clamp-3 break-words text-sm leading-relaxed text-default-500">
              {map.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-default-200/70 pt-3">
            <span className="text-sm text-default-500">
              Fase {map.phaseNumber ?? 1}
            </span>

            <span className="shrink-0 text-sm font-bold text-violet-500 transition group-hover:translate-x-0.5">
              Lihat detail →
            </span>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
