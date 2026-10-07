"use client";

import Link from "next/link";
import { Card, Chip } from "@heroui/react";

export function MapCard({ map }: { map: any }) {
  const total = map.rewards.reduce(
    (s: number, r: any) => s + (r.rewardType === "ROBUX" ? r.amount : 0),
    0,
  );

  return (
    <Link href={`/maps/${map.slug}`} className="block">
      <Card className="border border-white/10 bg-white/5">
        <Card.Content className="gap-4 p-5">
          <div>
            <h3 className="text-xl font-black">{map.name}</h3>

            <p className="mt-1 text-sm text-default-500">
              by {map.creatorName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Chip size="sm" variant="soft">
              {map.durationDays} Hari
            </Chip>

            <Chip size="sm" color="success" variant="soft">
              💰 {total} Robux
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
                : "Unverified"}
            </Chip>
          </div>

          {map.description && (
            <p className="line-clamp-2 text-sm text-default-500">
              {map.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-default-500">
              Phase {map.phaseNumber}
            </span>

            <span className="text-sm font-bold text-violet-400">
              Lihat Detail →
            </span>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}
