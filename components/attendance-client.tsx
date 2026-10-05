"use client";

import { useTransition } from "react";
import { Checkbox, Button } from "@heroui/react";
import {
  checkInAction,
  restartTrackerAction,
  setDeliveryStatusAction,
} from "@/actions/attendance";

type RewardType = "ROBUX" | "COIN" | "ITEM" | "XP" | "SPIN" | "OTHER";

type DeliveryStatus = "NOT_APPLICABLE" | "NOT_SENT" | "PENDING" | "SENT";

type AttendanceLog = {
  id: string;
  dayNumber: number;
  checkedInAt: string | Date;
};

type Reward = {
  id: string;
  dayNumber: number;
  rewardType: RewardType;
  amount: number;
  title: string;
  description?: string | null;
};

type AttendanceClaim = {
  id: string;
  dayNumber: number;
  claimedAt: string | Date;
  deliveryStatus: DeliveryStatus;
  reward: Reward;
};

type Tracker = {
  id: string;
  cycleNumber: number;
  lastAttendanceAt?: string | Date | null;
  completedAt?: string | Date | null;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  attendanceLogs: AttendanceLog[];
  claims: AttendanceClaim[];
};

type MapReward = Reward;

type MapData = {
  id: string;
  name: string;
  durationDays: number;
  rewards: MapReward[];
};

export function AttendanceClient({
  map,
  tracker,
}: {
  map: MapData;
  tracker: Tracker | null;
}) {
  const [pending, startTransition] = useTransition();

  const attendanceLogs = tracker?.attendanceLogs ?? [];
  const claims = tracker?.claims ?? [];

  /*
   * AttendanceLog adalah sumber utama untuk menentukan
   * hari terakhir yang sudah dihadiri.
   */
  const attendedDays = new Set(attendanceLogs.map((log) => log.dayNumber));

  /*
   * Claim hanya digunakan untuk reward.
   */
  const claimedRewards = new Map(
    claims.map((claim) => [claim.dayNumber, claim]),
  );

  /*
   * Tentukan hari berikutnya berdasarkan attendance,
   * bukan berdasarkan jumlah reward claim.
   */
  const lastAttendanceDay =
    attendanceLogs.length > 0
      ? Math.max(...attendanceLogs.map((log) => log.dayNumber))
      : 0;

  const nextDay = Math.min(lastAttendanceDay + 1, map.durationDays);

  const isCompleted =
    tracker?.status === "COMPLETED" || lastAttendanceDay >= map.durationDays;

  const hasCheckedInToday = tracker?.lastAttendanceAt
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(tracker.lastAttendanceAt)) ===
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date())
    : false;

  function handleCheckIn() {
    if (pending || hasCheckedInToday || isCompleted) {
      return;
    }

    startTransition(async () => {
      try {
        await checkInAction(map.id);
        location.reload();
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "Gagal melakukan absensi.",
        );
      }
    });
  }

  function handleRestart() {
    if (pending) {
      return;
    }

    startTransition(async () => {
      try {
        await restartTrackerAction(map.id);
        location.reload();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Gagal memulai ulang streak.",
        );
      }
    });
  }

  function handleDeliveryStatus(claim: AttendanceClaim) {
    if (pending) {
      return;
    }

    const nextStatus: Exclude<DeliveryStatus, "NOT_APPLICABLE"> =
      claim.deliveryStatus === "NOT_SENT"
        ? "PENDING"
        : claim.deliveryStatus === "PENDING"
          ? "SENT"
          : "NOT_SENT";

    startTransition(async () => {
      try {
        await setDeliveryStatusAction(claim.id, nextStatus);

        location.reload();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Gagal mengubah status pengiriman.",
        );
      }
    });
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(date));
  }

  function getDeliveryLabel(status: DeliveryStatus) {
    switch (status) {
      case "NOT_SENT":
        return "Belum dikirim";

      case "PENDING":
        return "Menunggu";

      case "SENT":
        return "Sudah dikirim";

      case "NOT_APPLICABLE":
        return "Tidak berlaku";
    }
  }

  return (
    <div className="space-y-5">
      {/* ACTION */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          isDisabled={pending || hasCheckedInToday || isCompleted || !tracker}
          onPress={handleCheckIn}
          className="skeuo-btn"
        >
          {pending
            ? "Memproses..."
            : isCompleted
              ? "Streak Selesai"
              : hasCheckedInToday
                ? "Sudah Hadir Hari Ini"
                : `Check-in Day ${nextDay}`}
        </Button>

        {tracker && (
          <Button
            variant="secondary"
            isDisabled={pending}
            onPress={handleRestart}
          >
            Mulai Ulang Streak
          </Button>
        )}
      </div>

      {/* INFO */}
      {tracker && (
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-default-500">Cycle</span>{" "}
              <span className="font-bold">#{tracker.cycleNumber}</span>
            </div>

            <div>
              <span className="text-default-500">Progress</span>{" "}
              <span className="font-bold">
                {lastAttendanceDay}/{map.durationDays}
              </span>
            </div>

            {tracker.lastAttendanceAt && (
              <div>
                <span className="text-default-500">Terakhir hadir</span>{" "}
                <span className="font-bold">
                  {formatDate(tracker.lastAttendanceAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAILY ATTENDANCE */}
      <div className="space-y-2">
        {map.rewards.map((reward) => {
          const day = reward.dayNumber;

          const attended = attendedDays.has(day);
          const claim = claimedRewards.get(day);

          const locked = !attended && day !== nextDay;

          return (
            <div
              key={reward.id}
              className={`attendance-row ${attended ? "attendance-done" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Checkbox isSelected={attended} isReadOnly>
                  {`Day ${day}`}
                </Checkbox>

                <div>
                  <p className="font-bold">
                    {reward.rewardType === "ROBUX"
                      ? `${reward.amount} Robux`
                      : reward.title}
                  </p>

                  {attended ? (
                    <p className="text-xs text-default-500">
                      Hadir:{" "}
                      {(() => {
                        const log = attendanceLogs.find(
                          (item) => item.dayNumber === day,
                        );

                        return log ? formatDate(log.checkedInAt) : "-";
                      })()}
                    </p>
                  ) : (
                    <p className="text-xs text-default-500">
                      {locked
                        ? "Selesaikan hari sebelumnya"
                        : "Siap di-check-in"}
                    </p>
                  )}
                </div>
              </div>

              {/* DELIVERY STATUS */}
              {claim && claim.deliveryStatus !== "NOT_APPLICABLE" && (
                <Button
                  size="sm"
                  variant={
                    claim.deliveryStatus === "SENT" ? "primary" : "secondary"
                  }
                  isDisabled={pending}
                  onPress={() => handleDeliveryStatus(claim)}
                >
                  {getDeliveryLabel(claim.deliveryStatus)}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
