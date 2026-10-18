"use client";

import { useEffect, useState, useTransition } from "react";
import { Checkbox, Button, Label, ListBox, Select } from "@heroui/react";
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

const fieldClass =
  "w-full min-w-0 rounded-2xl border border-default-200 bg-content1 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-default-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "block min-w-0 space-y-2 text-sm font-medium";

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

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

  const dateKey = (value: string | Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));

  const hasCheckedInToday = tracker?.lastAttendanceAt
    ? dateKey(tracker.lastAttendanceAt) === dateKey(new Date())
    : false;

  const selectedReward = configuredRewards.get(Number(selectedDay));

  const robuxTarget = userRewards.reduce(
    (sum, reward) => sum + (reward.rewardType === "ROBUX" ? reward.amount : 0),
    0,
  );

  const robuxSent = claims.reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus === "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const robuxOutstanding = claims.reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus !== "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const robuxProgress =
    robuxTarget > 0
      ? Math.min(100, Math.round((robuxSent / robuxTarget) * 100))
      : 0;

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

    if (!title.trim()) {
      alert("Judul reward wajib diisi.");
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      alert("Nominal reward harus berupa angka nol atau lebih.");
      return;
    }

    runAction(
      () =>
        saveUserMapRewardAction({
          mapId: map.id,
          dayNumber: Number(selectedDay),
          rewardType,
          amount: parsedAmount,
          title: title.trim(),
          description: description.trim(),
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
    return reward.rewardType === "ROBUX"
      ? `${formatNumber(reward.amount)} Robux`
      : reward.title;
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
    <div className="min-w-0 space-y-6">
      {/* ACTIONS */}
      <section className="rounded-3xl border border-default-200/70 bg-content1 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            isDisabled={
              pending ||
              hasCheckedInToday ||
              isCompleted ||
              tracker?.status === "ABANDONED"
            }
            onPress={handleCheckIn}
            className="skeuo-btn w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
            >
              Reset Data Testing
            </Button>
          )}
        </div>
      </section>

      {/* TRACKER PROGRESS */}
      {tracker && (
        <section className="rounded-3xl border border-default-200/70 bg-content1 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-500">
                Progress absensi
              </p>
              <h3 className="mt-1 text-xl font-black">
                Cycle #{tracker.cycleNumber}
              </h3>
              <p className="mt-1 text-sm text-default-500">
                {lastAttendanceDay} dari {map.durationDays} hari
              </p>
            </div>

            <span className="w-fit rounded-full border border-default-200 px-3 py-1 text-xs font-bold">
              {tracker.status === "COMPLETED"
                ? "Selesai"
                : tracker.status === "ABANDONED"
                  ? "Dihentikan"
                  : "Aktif"}
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-default-200">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((lastAttendanceDay / map.durationDays) * 100),
                )}%`,
              }}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-default-50/70 p-4">
              <p className="text-xs text-default-500">Target Robux pribadi</p>
              <p className="mt-1 break-words text-xl font-black">
                {formatNumber(robuxTarget)} R$
              </p>
            </div>
            <div className="rounded-2xl bg-default-50/70 p-4">
              <p className="text-xs text-default-500">Sudah terkirim</p>
              <p className="mt-1 break-words text-xl font-black text-success-600">
                {formatNumber(robuxSent)} R$
              </p>
            </div>
            <div className="rounded-2xl bg-default-50/70 p-4">
              <p className="text-xs text-default-500">Belum terkirim</p>
              <p className="mt-1 break-words text-xl font-black">
                {formatNumber(robuxOutstanding)} R$
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-default-500">Progress Robux terkirim</span>
              <strong>{robuxProgress}%</strong>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-default-200"
              role="progressbar"
              aria-label="Progress Robux terkirim"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={robuxProgress}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${robuxProgress}%` }}
              />
            </div>
            {robuxTarget === 0 && (
              <p className="mt-2 text-xs text-default-500">
                Atur reward Robux pribadi untuk mulai menghitung target.
              </p>
            )}
          </div>

          {tracker.lastAttendanceAt && (
            <p className="mt-4 text-xs text-default-500">
              Terakhir hadir: {formatDate(tracker.lastAttendanceAt)}
            </p>
          )}
        </section>
      )}

      {/* USER REWARD SETTINGS */}
      <section className="min-w-0 rounded-3xl border border-default-200/70 bg-content1 p-4 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-500">
            Personal reward
          </p>
          <h3 className="mt-1 text-xl font-black">Pengaturan reward pribadi</h3>
          <p className="mt-2 text-sm leading-6 text-default-500">
            Jadwal ini hanya berlaku untuk akunmu dan tetap tersimpan setelah
            streak dimulai ulang.
          </p>
        </div>

        <form onSubmit={handleSaveReward} className="min-w-0 space-y-4">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <div className={labelClass}>
              <Label>Hari reward</Label>
              <Select
                aria-label="Hari reward"
                selectedKey={selectedDay}
                onSelectionChange={(key) =>
                  key != null && setSelectedDay(String(key))
                }
                isDisabled={pending}
              >
                <Select.Trigger className="w-full rounded-2xl border border-default-200 bg-content1 px-4 py-3 text-sm text-foreground shadow-none data-[focus-visible=true]:border-violet-500">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="rounded-2xl border border-default-200 bg-content1 p-1 text-foreground shadow-none">
                  <ListBox className="max-h-64 overflow-y-auto rounded-xl bg-content1 p-1 text-foreground">
                    {Array.from(
                      { length: map.durationDays },
                      (_, index) => index + 1,
                    ).map((day) => (
                      <ListBox.Item
                        key={day}
                        id={String(day)}
                        textValue={`Day ${day}`}
                        className="rounded-xl px-3 py-2 text-sm text-foreground outline-none data-[focused=true]:bg-default-100 data-[selected=true]:bg-violet-500 data-[selected=true]:text-white"
                      >
                        Day {day}
                        {configuredRewards.has(day) ? " · Sudah diatur" : ""}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div className={labelClass}>
              <Label>Jenis reward</Label>
              <Select
                aria-label="Jenis reward"
                selectedKey={rewardType}
                onSelectionChange={(key) =>
                  key != null && setRewardType(String(key) as RewardType)
                }
                isDisabled={pending}
              >
                <Select.Trigger className="w-full rounded-2xl border border-default-200 bg-content1 px-4 py-3 text-sm text-foreground shadow-none data-[focus-visible=true]:border-violet-500">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="rounded-2xl border border-default-200 bg-content1 p-1 text-foreground shadow-none">
                  <ListBox className="rounded-xl bg-content1 p-1 text-foreground">
                    {rewardTypes.map((item) => (
                      <ListBox.Item
                        key={item.value}
                        id={item.value}
                        textValue={item.label}
                        className="rounded-xl px-3 py-2 text-sm text-foreground outline-none data-[focused=true]:bg-default-100 data-[selected=true]:bg-violet-500 data-[selected=true]:text-white"
                      >
                        {item.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <label className={labelClass}>
              <span>Nominal reward</span>
              <input
                className={fieldClass}
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={pending}
              />
              <span className="text-xs font-normal text-default-500">
                Digunakan untuk Robux atau reward kuantitatif.
              </span>
            </label>

            <label className={labelClass}>
              <span>Judul reward</span>
              <input
                className={fieldClass}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Bonus harian"
                required
                maxLength={120}
                disabled={pending}
              />
            </label>
          </div>

          <label className={labelClass}>
            <span>Deskripsi (opsional)</span>
            <textarea
              className={`${fieldClass} resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Catatan tentang reward ini"
              maxLength={1000}
              rows={3}
              disabled={pending}
            />
          </label>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
            <Button
              type="submit"
              isDisabled={pending}
              className="w-full sm:w-auto"
            >
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
                className="w-full sm:w-auto"
              >
                Hapus Reward
              </Button>
            )}
          </div>
        </form>
      </section>

      {/* ALL ATTENDANCE DAYS */}
      <section className="min-w-0 rounded-3xl border border-default-200/70 bg-content1 p-4 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-500">
            Daily checklist
          </p>
          <h3 className="mt-1 text-xl font-black">Daftar absensi</h3>
          <p className="mt-2 text-sm leading-6 text-default-500">
            Semua hari ditampilkan. Reward hanya muncul pada hari yang kamu
            konfigurasi.
          </p>
        </div>

        <div className="space-y-3">
          {Array.from(
            { length: map.durationDays },
            (_, index) => index + 1,
          ).map((day) => {
            const attended = attendedDays.has(day);
            const reward = configuredRewards.get(day);
            const claim = claimedRewards.get(day);
            const locked = !attended && day !== nextDay;
            const log = attendanceLogs.find((item) => item.dayNumber === day);

            return (
              <div
                key={day}
                className={`min-w-0 rounded-2xl border p-3 transition sm:p-4 ${
                  attended
                    ? "border-success-500/40 bg-success-500/[0.04]"
                    : "border-default-200 bg-default-50/40"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="pt-0.5">
                      <Checkbox isSelected={attended} isReadOnly>
                        {`Day ${day}`}
                      </Checkbox>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-bold">
                        {reward ? rewardLabel(reward) : "Absensi harian"}
                      </p>

                      <p className="mt-1 break-words text-xs text-default-500">
                        {reward
                          ? reward.rewardType === "ROBUX"
                            ? "Milestone Robux pribadi"
                            : reward.title
                          : "Tidak ada reward yang diatur"}
                      </p>

                      {reward?.description && (
                        <p className="mt-1 break-words text-xs leading-5 text-default-500">
                          {reward.description}
                        </p>
                      )}

                      {attended && log && (
                        <p className="mt-2 text-xs text-default-500">
                          Hadir: {formatDate(log.checkedInAt)}
                        </p>
                      )}

                      {!attended && (
                        <p className="mt-2 text-xs text-default-500">
                          {locked
                            ? "Selesaikan hari sebelumnya"
                            : "Siap di-check-in"}
                        </p>
                      )}

                      {claim && (
                        <p className="mt-2 break-words text-xs text-default-500">
                          Klaim tercatat: {claim.rewardTitle} ·{" "}
                          {claim.rewardType === "ROBUX"
                            ? `${formatNumber(claim.rewardAmount)} Robux`
                            : claim.rewardType}
                        </p>
                      )}
                    </div>
                  </div>

                  {claim?.rewardType === "ROBUX" && (
                    <Button
                      size="sm"
                      variant={
                        claim.deliveryStatus === "SENT"
                          ? "primary"
                          : "secondary"
                      }
                      isDisabled={pending}
                      onPress={() => handleDeliveryStatus(claim)}
                      className="w-full shrink-0 sm:w-auto"
                    >
                      {deliveryLabel(claim.deliveryStatus)}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
