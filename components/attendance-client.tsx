"use client";

import { useEffect, useState, useTransition } from "react";
import { Checkbox, Button } from "@heroui/react";
import {
  checkInAction,
  restartTrackerAction,
  setDeliveryStatusAction,
  saveUserMapRewardAction,
  deleteUserMapRewardAction,
  resetMapProgressAction,
} from "@/actions/attendance";

type RewardType = "ROBUX" | "COIN" | "ITEM" | "XP" | "SPIN" | "OTHER";
type DeliveryStatus = "NOT_APPLICABLE" | "NOT_SENT" | "PENDING" | "SENT";

type AttendanceLog = {
  id: string;
  dayNumber: number;
  checkedInAt: string | Date;
};

type UserReward = {
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
  rewardType: RewardType;
  rewardAmount: number;
  rewardTitle: string;
  rewardDescription?: string | null;
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

type MapData = {
  id: string;
  name: string;
  durationDays: number;
};

const rewardTypes: { value: RewardType; label: string }[] = [
  { value: "ROBUX", label: "Robux" },
  { value: "COIN", label: "Coin" },
  { value: "ITEM", label: "Item" },
  { value: "XP", label: "XP" },
  { value: "SPIN", label: "Spin" },
  { value: "OTHER", label: "Lainnya" },
];

export function AttendanceClient({
  map,
  tracker,
  userRewards,
}: {
  map: MapData;
  tracker: Tracker | null;
  userRewards: UserReward[];
}) {
  const [pending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState("1");
  const [rewardType, setRewardType] = useState<RewardType>("ROBUX");
  const [amount, setAmount] = useState("0");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const attendanceLogs = tracker?.attendanceLogs ?? [];
  const claims = tracker?.claims ?? [];

  const attendedDays = new Set(attendanceLogs.map((log) => log.dayNumber));

  const claimedRewards = new Map(
    claims.map((claim) => [claim.dayNumber, claim]),
  );

  const configuredRewards = new Map(
    userRewards.map((reward) => [reward.dayNumber, reward]),
  );

  const lastAttendanceDay = attendanceLogs.length
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

  const selectedReward = configuredRewards.get(Number(selectedDay));

  useEffect(() => {
    const reward = userRewards.find(
      (item) => item.dayNumber === Number(selectedDay),
    );

    setRewardType(reward?.rewardType ?? "ROBUX");
    setAmount(String(reward?.amount ?? 0));
    setTitle(reward?.title ?? "");
    setDescription(reward?.description ?? "");
  }, [selectedDay, userRewards]);

  function runAction(action: () => Promise<unknown>, fallback: string) {
    if (pending) return;

    startTransition(async () => {
      try {
        await action();
        location.reload();
      } catch (error) {
        alert(error instanceof Error ? error.message : fallback);
      }
    });
  }

  function handleCheckIn() {
    if (hasCheckedInToday || isCompleted) return;

    runAction(() => checkInAction(map.id), "Gagal melakukan absensi.");
  }

  function handleRestart() {
    if (!window.confirm("Mulai ulang streak? Riwayat lama tetap disimpan.")) {
      return;
    }

    runAction(
      () => restartTrackerAction(map.id),
      "Gagal memulai ulang streak.",
    );
  }

  function handleSaveReward(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    runAction(
      () =>
        saveUserMapRewardAction({
          mapId: map.id,
          dayNumber: Number(selectedDay),
          rewardType,
          amount: Number(amount),
          title,
          description,
        }),
      "Gagal menyimpan reward.",
    );
  }

  function handleDeleteReward() {
    if (!selectedReward) return;

    if (!window.confirm(`Hapus konfigurasi reward Day ${selectedDay}?`)) {
      return;
    }

    runAction(
      () => deleteUserMapRewardAction(map.id, Number(selectedDay)),
      "Gagal menghapus reward.",
    );
  }

  function handleDeliveryStatus(claim: AttendanceClaim) {
    const nextStatus: Exclude<DeliveryStatus, "NOT_APPLICABLE"> =
      claim.deliveryStatus === "NOT_SENT"
        ? "PENDING"
        : claim.deliveryStatus === "PENDING"
          ? "SENT"
          : "NOT_SENT";

    runAction(
      () => setDeliveryStatusAction(claim.id, nextStatus),
      "Gagal mengubah status pengiriman.",
    );
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(date));
  }

  function deliveryLabel(status: DeliveryStatus) {
    switch (status) {
      case "NOT_SENT":
        return "Belum dikirim";
      case "PENDING":
        return "Menunggu";
      case "SENT":
        return "Sudah dikirim";
      default:
        return "Tidak berlaku";
    }
  }

  function rewardLabel(reward: UserReward) {
    if (reward.rewardType === "ROBUX") {
      return `${reward.amount} Robux`;
    }

    return reward.title;
  }

  function handleResetMapProgress() {
    const confirmed = window.confirm(
      "PERINGATAN: Semua riwayat absensi dan klaim untuk map ini akan dihapus. " +
        "Cycle akan kembali ke #1. Konfigurasi reward pribadi tetap tersimpan. " +
        "Tindakan ini tidak dapat dibatalkan. Lanjutkan?",
    );

    if (!confirmed) return;

    runAction(
      () => resetMapProgressAction(map.id),
      "Gagal mereset progres map.",
    );
  }

  return (
    <div className="space-y-6">
      {/* CHECK-IN */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          isDisabled={
            pending ||
            hasCheckedInToday ||
            isCompleted ||
            tracker?.status === "ABANDONED"
          }
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
        {process.env.NODE_ENV !== "production" && tracker && (
          <Button
            type="button"
            variant="secondary"
            isDisabled={pending}
            onPress={handleResetMapProgress}
          >
            Reset Data Testing
          </Button>
        )}
      </div>

      {/* PROGRESS */}
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

      {/* USER REWARD SETTINGS */}
      <section className="space-y-4 rounded-2xl border border-white/10 p-4">
        <div>
          <h3 className="text-lg font-bold">Pengaturan reward pribadi</h3>
          <p className="text-sm text-default-500">
            Jadwal ini hanya berlaku untuk akunmu dan tetap tersimpan setelah
            streak dimulai ulang.
          </p>
        </div>

        <form onSubmit={handleSaveReward} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Hari reward</span>
              <select
                className="w-full rounded-xl border border-default-200 bg-default-50 p-3 text-default-900"
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
                disabled={pending}
              >
                {Array.from(
                  { length: map.durationDays },
                  (_, index) => index + 1,
                ).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                    {configuredRewards.has(day) ? " · Sudah diatur" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Jenis reward</span>
              <select
                className="w-full rounded-xl border border-default-200 bg-default-50 p-3 text-default-900"
                value={rewardType}
                onChange={(event) =>
                  setRewardType(event.target.value as RewardType)
                }
                disabled={pending}
              >
                {rewardTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Nominal (untuk Robux atau reward kuantitatif)</span>
              <input
                className="w-full rounded-xl border border-default-200 bg-default-50 p-3 text-default-900"
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={pending}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span>Judul reward</span>
              <input
                className="w-full rounded-xl border border-default-200 bg-default-50 p-3 text-default-900"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Bonus harian"
                required
                maxLength={120}
                disabled={pending}
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span>Deskripsi (opsional)</span>
            <textarea
              className="w-full rounded-xl border border-default-200 bg-default-50 p-3 text-default-900"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Catatan tentang reward ini"
              maxLength={1000}
              rows={2}
              disabled={pending}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" isDisabled={pending}>
              {pending
                ? "Menyimpan..."
                : selectedReward
                  ? "Simpan Perubahan"
                  : "Tambah Reward"}
            </Button>

            {selectedReward && (
              <Button
                type="button"
                variant="secondary"
                isDisabled={pending}
                onPress={handleDeleteReward}
              >
                Hapus Reward
              </Button>
            )}
          </div>
        </form>
      </section>

      {/* ALL ATTENDANCE DAYS */}
      <section className="space-y-2">
        <div className="mb-3">
          <h3 className="text-lg font-bold">Daftar absensi</h3>
          <p className="text-sm text-default-500">
            Semua hari ditampilkan. Reward hanya muncul pada hari yang kamu
            konfigurasi.
          </p>
        </div>

        {Array.from({ length: map.durationDays }, (_, index) => index + 1).map(
          (day) => {
            const attended = attendedDays.has(day);
            const reward = configuredRewards.get(day);
            const claim = claimedRewards.get(day);
            const locked = !attended && day !== nextDay;

            const log = attendanceLogs.find((item) => item.dayNumber === day);

            return (
              <div
                key={day}
                className={`attendance-row ${
                  attended ? "attendance-done" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox isSelected={attended} isReadOnly>
                    {`Day ${day}`}
                  </Checkbox>

                  <div>
                    <p className="font-bold">
                      {reward ? rewardLabel(reward) : "Absensi harian"}
                    </p>

                    {reward ? (
                      <p className="text-xs text-default-500">
                        {reward.rewardType === "ROBUX"
                          ? "Milestone Robux pribadi"
                          : reward.title}
                      </p>
                    ) : (
                      <p className="text-xs text-default-500">
                        Tidak ada reward yang diatur
                      </p>
                    )}

                    {attended && log && (
                      <p className="text-xs text-default-500">
                        Hadir: {formatDate(log.checkedInAt)}
                      </p>
                    )}

                    {!attended && (
                      <p className="text-xs text-default-500">
                        {locked
                          ? "Selesaikan hari sebelumnya"
                          : "Siap di-check-in"}
                      </p>
                    )}

                    {claim && (
                      <p className="mt-1 text-xs text-default-500">
                        Klaim tercatat: {claim.rewardTitle} ·{" "}
                        {claim.rewardType === "ROBUX"
                          ? `${claim.rewardAmount} Robux`
                          : claim.rewardType}
                      </p>
                    )}
                  </div>
                </div>

                {claim?.rewardType === "ROBUX" && (
                  <Button
                    size="sm"
                    variant={
                      claim.deliveryStatus === "SENT" ? "primary" : "secondary"
                    }
                    isDisabled={pending}
                    onPress={() => handleDeliveryStatus(claim)}
                  >
                    {deliveryLabel(claim.deliveryStatus)}
                  </Button>
                )}
              </div>
            );
          },
        )}
      </section>
    </div>
  );
}
