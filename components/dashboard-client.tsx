"use client";

import { Card, Chip, Button } from "@heroui/react";
import { setDeliveryStatusAction } from "@/actions/attendance";

interface DashboardClientProps {
  profile: {
    displayName: string | null;
    username: string | null;
  };

  trackers: any[];

  submittedMaps: any[];

  stats: {
    activeMaps: number;
    pendingRobux: number;
    sentRobux: number;
    pendingMilestones: number;
  };
}

export function DashboardClient({
  profile,
  trackers,
  submittedMaps,
  stats,
}: DashboardClientProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-black">Dashboard</h1>

        <p className="mt-2 text-default-500">
          Halo, {profile.displayName ?? profile.username ?? "User"}.
        </p>
      </section>

      {/* Statistics */}
      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Tracked maps" value={stats.activeMaps} />

        <Stat label="Pending Robux" value={`${stats.pendingRobux} R$`} />

        <Stat label="Sent Robux" value={`${stats.sentRobux} R$`} />

        <Stat label="Pending milestones" value={stats.pendingMilestones} />
      </section>

      {/* Progress */}
      <section className="mt-10">
        <h2 className="text-2xl font-black">Progress kamu</h2>

        <div className="mt-4 space-y-4">
          {trackers.length ? (
            trackers.map((tracker) => (
              <Card
                key={tracker.id}
                className="border border-white/10 bg-white/[.03]"
              >
                <Card.Content>
                  {/* Tracker Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black">{tracker.map.name}</h3>

                      <p className="text-sm text-default-500">
                        Cycle {tracker.cycleNumber} · {tracker.claims.length}/
                        {tracker.map.durationDays} hari
                      </p>
                    </div>

                    <Chip
                      color={
                        tracker.status === "ACTIVE"
                          ? "accent"
                          : tracker.status === "COMPLETED"
                            ? "success"
                            : "default"
                      }
                    >
                      {tracker.status}
                    </Chip>
                  </div>

                  {/* Rewards */}
                  <div className="mt-4 space-y-2">
                    {tracker.claims
                      .filter(
                        (claim: any) => claim.reward.rewardType === "ROBUX",
                      )
                      .map((claim: any) => {
                        const nextDeliveryStatus =
                          claim.deliveryStatus === "NOT_SENT"
                            ? "PENDING"
                            : claim.deliveryStatus === "PENDING"
                              ? "SENT"
                              : "NOT_SENT";

                        return (
                          <div
                            key={claim.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 p-3"
                          >
                            <span>
                              Robux hari {claim.dayNumber} ·{" "}
                              {claim.reward.amount} R$
                            </span>

                            <form
                              action={async () => {
                                await setDeliveryStatusAction(
                                  claim.id,
                                  nextDeliveryStatus,
                                );
                              }}
                            >
                              <Button
                                type="submit"
                                size="sm"
                                variant={
                                  claim.deliveryStatus === "SENT"
                                    ? "primary"
                                    : "secondary"
                                }
                              >
                                {claim.deliveryStatus === "SENT"
                                  ? "Sudah dikirim"
                                  : claim.deliveryStatus === "PENDING"
                                    ? "Menunggu pengiriman"
                                    : "Belum dikirim"}
                              </Button>
                            </form>
                          </div>
                        );
                      })}
                  </div>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card className="border border-dashed border-white/10 bg-white/[.02]">
              <Card.Content>
                <p className="text-default-500">
                  Belum ada map yang kamu ikuti.
                </p>

                <p className="mt-1 text-sm text-default-600">
                  Pilih map dari halaman utama untuk mulai mengikuti absensi.
                </p>
              </Card.Content>
            </Card>
          )}
        </div>
      </section>

      {/* Submitted Maps */}
      <section className="mt-12">
        <div>
          <h2 className="text-2xl font-black">Map yang kamu submit</h2>

          <p className="mt-1 text-sm text-default-500">
            Map yang kamu kirim akan direview oleh admin sebelum tersedia
            sebagai map aktif.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {submittedMaps.length ? (
            submittedMaps.map((map) => (
              <SubmittedMapCard key={map.id} map={map} />
            ))
          ) : (
            <Card className="border border-dashed border-white/10 bg-white/[.02]">
              <Card.Content>
                <p className="text-default-500">
                  Kamu belum pernah mengirim map.
                </p>
              </Card.Content>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================
   STAT CARD
========================================= */

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border border-white/10 bg-white/[.03]">
      <Card.Content>
        <p className="text-sm text-default-500">{label}</p>

        <p className="mt-1 text-2xl font-black">{value}</p>
      </Card.Content>
    </Card>
  );
}

/* =========================================
   SUBMITTED MAP CARD
========================================= */

function SubmittedMapCard({ map }: { map: any }) {
  const isPending = map.status === "PENDING_REVIEW";

  const isActive = map.status === "ACTIVE";

  const isRejected = map.status === "REJECTED";

  return (
    <Card className="border border-white/10 bg-white/[.03]">
      <Card.Content>
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Map information */}
          <div className="min-w-0">
            <h3 className="text-lg font-black">{map.name}</h3>

            <p className="mt-1 text-sm text-default-500">
              Creator: {map.creatorName}
            </p>

            <p className="mt-1 text-sm text-default-500">
              Durasi: {map.durationDays} hari
            </p>

            {map.description && (
              <p className="mt-3 max-w-2xl text-sm text-default-400">
                {map.description}
              </p>
            )}

            <p className="mt-3 text-xs text-default-600">
              Submit:{" "}
              {new Date(map.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Status */}
          <div className="shrink-0">
            <Chip
              color={
                isActive
                  ? "success"
                  : isPending
                    ? "warning"
                    : isRejected
                      ? "danger"
                      : "default"
              }
              variant="soft"
            >
              {isPending
                ? "Menunggu Review"
                : isActive
                  ? "Aktif"
                  : isRejected
                    ? "Ditolak"
                    : map.status}
            </Chip>
          </div>
        </div>

        {/* Verification */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <span className="text-xs text-default-500">Status verifikasi:</span>

          <span className="rounded-full bg-white/5 px-3 py-1 text-xs">
            {map.verificationStatus}
          </span>
        </div>

        {/* Roblox URL */}
        {map.robloxUrl && (
          <div className="mt-4">
            <a
              href={map.robloxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-violet-400 hover:text-violet-300"
            >
              Buka Roblox ↗
            </a>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
