"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  checkInAction,
  restartTrackerAction,
  setDeliveryStatusAction,
  saveUserMapRewardAction,
  deleteUserMapRewardAction,
  resetMapProgressAction,
} from "@/actions/attendance";
import { useDialogs } from "@/components/dialog-provider";
import {
  inputClass,
  listBoxClass,
  optionClass,
  popoverClass,
  selectTriggerClass,
  skeuoButton,
  textareaClass,
  textareaShellClass,
} from "@/lib/ui";

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
  const router = useRouter();
  const { confirm, notify } = useDialogs();

  // `busyKey` = aksi yang sedang berjalan. Hanya tombol dari aksi itu yang
  // dinonaktifkan; tombol & field lain tidak ikut meredup. `busyRef` mencegah
  // klik ganda sebelum state sempat diperbarui.
  const busyRef = useRef(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // State form diisi langsung dari data hari 1 pada render pertama,
  // sehingga nilai tidak "berubah sendiri" sesaat setelah halaman tampil.
  const firstReward = userRewards.find((item) => item.dayNumber === 1);

  const [selectedDay, setSelectedDay] = useState("1");
  const [rewardType, setRewardType] = useState<RewardType>(
    firstReward?.rewardType ?? "ROBUX",
  );
  const [amount, setAmount] = useState(String(firstReward?.amount ?? 0));
  const [title, setTitle] = useState(firstReward?.title ?? "");
  const [description, setDescription] = useState(
    firstReward?.description ?? "",
  );

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

  // Form disinkronkan ulang HANYA saat hari yang dipilih berganti atau data
  // reward hari itu benar-benar berubah. Refresh data karena aksi lain
  // (mis. ubah status kirim) tidak menimpa isian yang sedang diketik.
  const selectedRewardSignature = selectedReward
    ? [
        selectedReward.id,
        selectedReward.rewardType,
        selectedReward.amount,
        selectedReward.title,
        selectedReward.description ?? "",
      ].join("|")
    : "none";

  useEffect(() => {
    const reward = configuredRewards.get(Number(selectedDay));

    setRewardType(reward?.rewardType ?? "ROBUX");
    setAmount(String(reward?.amount ?? 0));
    setTitle(reward?.title ?? "");
    setDescription(reward?.description ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, selectedRewardSignature]);

  /**
   * Menjalankan server action TANPA reload halaman. Server action sudah
   * memanggil revalidatePath(), dan router.refresh() memastikan data terbaru
   * tampil — semuanya tanpa kilatan layar.
   */
  async function runAction(
    key: string,
    action: () => Promise<unknown>,
    fallback: string,
  ) {
    if (busyRef.current) return;

    busyRef.current = true;
    setBusyKey(key);

    let failure: string | null = null;

    try {
      await action();
      router.refresh();
    } catch (error) {
      failure = error instanceof Error ? error.message : fallback;
    } finally {
      busyRef.current = false;
      setBusyKey(null);
    }

    if (failure) {
      await notify({
        title: "Terjadi kesalahan",
        description: failure,
        tone: "danger",
      });
    }
  }

  function handleCheckIn() {
    if (hasCheckedInToday || isCompleted) return;

    void runAction(
      "checkin",
      () => checkInAction(map.id),
      "Gagal melakukan absensi.",
    );
  }

  async function handleRestart() {
    const ok = await confirm({
      title: "Mulai ulang streak?",
      description: "Riwayat lama tetap disimpan.",
      confirmLabel: "Mulai ulang",
      tone: "warning",
    });

    if (!ok) return;

    await runAction(
      "restart",
      () => restartTrackerAction(map.id),
      "Gagal memulai ulang streak.",
    );
  }

  async function handleSaveReward(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      await notify({
        title: "Judul reward wajib diisi",
        tone: "warning",
      });
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      await notify({
        title: "Nominal tidak valid",
        description: "Nominal reward harus berupa angka nol atau lebih.",
        tone: "warning",
      });
      return;
    }

    await runAction(
      "save",
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

  async function handleDeleteReward() {
    if (!selectedReward) return;

    const ok = await confirm({
      title: `Hapus reward Day ${selectedDay}?`,
      description: "Konfigurasi reward untuk hari ini akan dihapus.",
      confirmLabel: "Hapus reward",
      tone: "danger",
    });

    if (!ok) return;

    await runAction(
      "delete",
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

    void runAction(
      `delivery-${claim.id}`,
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

  async function handleResetMapProgress() {
    const ok = await confirm({
      title: "Reset semua progres map ini?",
      description:
        "Semua riwayat absensi dan klaim untuk map ini akan dihapus dan cycle kembali ke #1. Konfigurasi reward pribadi tetap tersimpan. Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Reset progres",
      tone: "danger",
    });

    if (!ok) return;

    await runAction(
      "reset",
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
            variant="primary"
            isDisabled={
              busyKey === "checkin" ||
              hasCheckedInToday ||
              isCompleted ||
              tracker?.status === "ABANDONED"
            }
            onPress={handleCheckIn}
            className={`${skeuoButton("primary")} w-full sm:w-auto`}
          >
            {isCompleted
              ? "Streak Selesai"
              : hasCheckedInToday
                ? "Sudah Hadir Hari Ini"
                : `Check-in Day ${nextDay}`}
          </Button>

          {tracker && (
            <Button
              variant="secondary"
              isDisabled={busyKey === "restart"}
              onPress={() => void handleRestart()}
              className={`${skeuoButton("secondary")} w-full sm:w-auto`}
            >
              Mulai Ulang Streak
            </Button>
          )}

          {process.env.NODE_ENV !== "production" && tracker && (
            <Button
              type="button"
              variant="secondary"
              isDisabled={busyKey === "reset"}
              onPress={() => void handleResetMapProgress()}
              className={`${skeuoButton("secondary")} w-full sm:w-auto`}
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

        <form
          onSubmit={(event) => void handleSaveReward(event)}
          className="min-w-0 space-y-4"
        >
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              selectedKey={selectedDay}
              onSelectionChange={(key) =>
                key != null && setSelectedDay(String(key))
              }
            >
              <Label>Hari Reward</Label>

              <Select.Trigger className={selectTriggerClass}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover className={popoverClass}>
                <ListBox className={listBoxClass}>
                  {Array.from(
                    { length: map.durationDays },
                    (_, index) => index + 1,
                  ).map((day) => (
                    <ListBox.Item
                      key={day}
                      id={String(day)}
                      textValue={`Day ${day}`}
                      className={optionClass}
                    >
                      Day {day}
                      {configuredRewards.has(day) ? " · Sudah diatur" : ""}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <Select
              selectedKey={rewardType}
              onSelectionChange={(key) =>
                key != null && setRewardType(String(key) as RewardType)
              }
            >
              <Label>Jenis Reward</Label>

              <Select.Trigger className={selectTriggerClass}>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>

              <Select.Popover className={popoverClass}>
                <ListBox className={listBoxClass}>
                  {rewardTypes.map((item) => (
                    <ListBox.Item
                      key={item.value}
                      id={item.value}
                      textValue={item.label}
                      className={optionClass}
                    >
                      {item.label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <TextField value={amount} onChange={setAmount} isRequired>
              <Label>Nominal Reward</Label>
              <Input className={inputClass} type="number" min="0" step="1" />
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                Digunakan untuk Robux atau reward kuantitatif.
              </p>
            </TextField>

            <TextField value={title} onChange={setTitle} isRequired>
              <Label>Judul Reward</Label>
              <Input
                className={inputClass}
                placeholder="Contoh: Bonus harian"
                maxLength={120}
              />
            </TextField>
          </div>

          <TextField value={description} onChange={setDescription}>
            <Label>Deskripsi (opsional)</Label>
            <div className={textareaShellClass}>
              <TextArea
                className={textareaClass}
                placeholder="Catatan tentang reward ini"
                maxLength={1000}
                rows={3}
              />
            </div>
          </TextField>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
            <Button
              type="submit"
              variant="primary"
              isDisabled={busyKey === "save"}
              className={`${skeuoButton("primary")} w-full sm:w-auto`}
            >
              {selectedReward ? "Simpan Perubahan" : "Tambah Reward"}
            </Button>

            {selectedReward && (
              <Button
                type="button"
                variant="secondary"
                isDisabled={busyKey === "delete"}
                onPress={() => void handleDeleteReward()}
                className={`${skeuoButton("secondary")} w-full sm:w-auto`}
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
                      isDisabled={busyKey === `delivery-${claim.id}`}
                      onPress={() => handleDeliveryStatus(claim)}
                      className={`${skeuoButton(
                        claim.deliveryStatus === "SENT"
                          ? "primary"
                          : "secondary",
                      )} w-full shrink-0 sm:w-auto`}
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
