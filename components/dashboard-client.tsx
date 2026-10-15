"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip } from "@heroui/react";
import { setDeliveryStatusAction } from "@/actions/attendance";

type DeliveryStatus = "NOT_APPLICABLE" | "NOT_SENT" | "PENDING" | "SENT";

type Claim = {
  id: string;
  dayNumber: number;
  rewardType: string;
  rewardAmount: number;
  rewardTitle: string;
  deliveryStatus: DeliveryStatus;
};

type DashboardTracker = {
  id: string;
  mapId: string;
  cycleNumber: number;
  status: string;
  map: {
    name: string;
    durationDays: number;
    slug?: string;
  };
  attendanceLogs: { dayNumber: number }[];
  claims: Claim[];
  userRewards: {
    dayNumber: number;
    rewardType: string;
    amount: number;
    title: string;
  }[];
};

type Props = {
  profile: {
    displayName: string;
    username: string;
  };
  trackers: DashboardTracker[];
  submittedMaps: any[];
  stats: {
    activeMaps: number;
    targetRobux: number;
    outstandingRobux: number;
    sentRobux: number;
    pendingMilestones: number;
  };
};

function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}

function nextDeliveryStatus(
  status: DeliveryStatus,
): Exclude<DeliveryStatus, "NOT_APPLICABLE"> {
  if (status === "NOT_SENT") return "PENDING";
  if (status === "PENDING") return "SENT";
  return "NOT_SENT";
}

function deliveryLabel(status: DeliveryStatus) {
  if (status === "SENT") return "Sudah dikirim";
  if (status === "PENDING") return "Menunggu";
  if (status === "NOT_SENT") return "Belum dikirim";
  return "Tidak berlaku";
}

function trackerStatusLabel(status: string) {
  if (status === "ACTIVE") return "Aktif";
  if (status === "COMPLETED") return "Selesai";
  if (status === "ABANDONED") return "Dihentikan";
  return status;
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="min-w-0 border border-default-200/70 bg-content1">
      <Card.Content className="gap-2 p-4 sm:p-5">
        <p className="text-sm text-default-500">{label}</p>
        <p className="break-words text-2xl font-black tracking-tight sm:text-3xl">
          {value}
        </p>
        <p className="text-xs text-default-500">{detail}</p>
      </Card.Content>
    </Card>
  );
}

function TrackerCard({ tracker }: { tracker: DashboardTracker }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const duration = tracker.map.durationDays || 1;
  const attendedDays = new Set(
    tracker.attendanceLogs.map((log) => log.dayNumber),
  ).size;
  const attendanceProgress = Math.min(
    100,
    Math.round((attendedDays / duration) * 100),
  );

  const robuxTarget = tracker.userRewards.reduce(
    (sum, reward) => sum + (reward.rewardType === "ROBUX" ? reward.amount : 0),
    0,
  );

  const robuxSent = tracker.claims.reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus === "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const outstandingRobux = tracker.claims.reduce(
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

  function changeDeliveryStatus(claim: Claim) {
    if (pending || claim.rewardType !== "ROBUX") return;

    const status = nextDeliveryStatus(claim.deliveryStatus);

    startTransition(async () => {
      try {
        await setDeliveryStatusAction(claim.id, status);
        router.refresh();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Gagal memperbarui status pengiriman.",
        );
      }
    });
  }

  return (
    <Card className="min-w-0 border border-default-200/70 bg-content1">
      <Card.Content className="min-w-0 gap-5 p-4 sm:p-6">
        <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-black sm:text-xl">
              {tracker.map.name}
            </h3>
            <p className="mt-1 text-sm text-default-500">
              Cycle #{tracker.cycleNumber} · {attendedDays}/{duration} hari
            </p>
          </div>
          <Chip
            size="sm"
            color={
              tracker.status === "ACTIVE"
                ? "success"
                : tracker.status === "COMPLETED"
                  ? "accent"
                  : "default"
            }
            variant="soft"
          >
            {trackerStatusLabel(tracker.status)}
          </Chip>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-default-50/70 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-default-500">Progress absensi</span>
              <strong>{attendanceProgress}%</strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-default-200">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${attendanceProgress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-default-50/70 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-default-500">Robux terkirim</span>
              <strong>{robuxProgress}%</strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-default-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${robuxProgress}%` }}
              />
            </div>
            <p className="mt-2 break-words text-xs text-default-500">
              {formatNumber(robuxSent)} / {formatNumber(robuxTarget)} R$
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-default-200 p-3 sm:p-4">
            <p className="text-xs text-default-500">Belum terkirim</p>
            <p className="mt-1 break-words text-lg font-black">
              {formatNumber(outstandingRobux)} R$
            </p>
          </div>
          <div className="rounded-2xl border border-default-200 p-3 sm:p-4">
            <p className="text-xs text-default-500">Klaim Robux</p>
            <p className="mt-1 text-lg font-black">
              {
                tracker.claims.filter((claim) => claim.rewardType === "ROBUX")
                  .length
              }
            </p>
          </div>
        </div>

        {tracker.claims.some((claim) => claim.rewardType === "ROBUX") && (
          <div className="space-y-3 border-t border-default-200 pt-4">
            <div>
              <h4 className="font-bold">Status pengiriman Robux</h4>
              <p className="mt-1 text-xs text-default-500">
                Klik status untuk mengubahnya ke tahap berikutnya.
              </p>
            </div>

            {tracker.claims
              .filter((claim) => claim.rewardType === "ROBUX")
              .map((claim) => (
                <div
                  key={claim.id}
                  className="flex min-w-0 flex-col gap-3 rounded-2xl border border-default-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold">
                      Day {claim.dayNumber} · {claim.rewardAmount} Robux
                    </p>
                    <p className="break-words text-sm text-default-500">
                      {claim.rewardTitle}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant={
                      claim.deliveryStatus === "SENT" ? "primary" : "secondary"
                    }
                    isDisabled={pending}
                    onPress={() => changeDeliveryStatus(claim)}
                    className="shrink-0"
                  >
                    {pending
                      ? "Memproses..."
                      : deliveryLabel(claim.deliveryStatus)}
                  </Button>
                </div>
              ))}
          </div>
        )}

        {tracker.map.slug && (
          <div>
            <a
              href={`/maps/${tracker.map.slug}`}
              className="inline-flex rounded-xl border border-default-200 px-4 py-2 text-sm font-bold transition hover:border-violet-400 hover:text-violet-500"
            >
              Buka tracker map →
            </a>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

function SubmittedMapCard({ map }: { map: any }) {
  const status = String(map.status ?? "PENDING_REVIEW");
  const label =
    status === "ACTIVE"
      ? "Aktif"
      : status === "PENDING_REVIEW"
        ? "Menunggu review"
        : status === "INACTIVE"
          ? "Tidak aktif"
          : status === "EXPIRED"
            ? "Kedaluwarsa"
            : status;

  return (
    <div
      key={map.id}
      className="flex min-w-0 flex-col gap-3 rounded-2xl border border-default-200 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="break-words font-bold">{map.name}</p>
        <p className="mt-1 break-words text-sm text-default-500">
          {map.durationDays} hari · {map.creatorName}
        </p>
      </div>
      <Chip
        size="sm"
        color={status === "ACTIVE" ? "success" : "warning"}
        variant="soft"
      >
        {label}
      </Chip>
    </div>
  );
}

export function DashboardClient({
  profile,
  trackers,
  submittedMaps,
  stats,
}: Props) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-500">
            RbxDaily
          </p>
          <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 break-words text-sm text-default-500">
            Halo, {profile.displayName}
            {profile.username ? ` (@${profile.username})` : ""}. Pantau absensi
            dan status reward kamu di sini.
          </p>
        </div>
      </header>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Map aktif"
          value={String(stats.activeMaps)}
          detail="Tracker yang sedang berjalan"
        />
        <StatCard
          label="Target Robux pribadi"
          value={`${formatNumber(stats.targetRobux)} R$`}
          detail="Total konfigurasi reward pribadi"
        />
        <StatCard
          label="Robux belum terkirim"
          value={`${formatNumber(stats.outstandingRobux)} R$`}
          detail={`${stats.pendingMilestones} milestone belum terkirim`}
        />
        <StatCard
          label="Robux terkirim"
          value={`${formatNumber(stats.sentRobux)} R$`}
          detail="Berdasarkan status klaim SENT"
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black">Progress map</h2>
          <p className="mt-1 text-sm text-default-500">
            Pantau progress absensi dan pengiriman reward setiap map.
          </p>
        </div>

        {trackers.length > 0 ? (
          <div className="grid min-w-0 gap-4">
            {trackers.map((tracker) => (
              <TrackerCard key={tracker.id} tracker={tracker} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-default-300 p-8 text-center">
            <h3 className="font-bold">Belum ada tracker</h3>
            <p className="mt-2 text-sm text-default-500">
              Buka halaman map dan lakukan check-in untuk mulai mencatat
              progress.
            </p>
            <a
              href="/"
              className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Jelajahi map
            </a>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black">Map yang kamu kirim</h2>
          <p className="mt-1 text-sm text-default-500">
            Pantau status review map yang sudah kamu ajukan.
          </p>
        </div>

        {submittedMaps.length > 0 ? (
          <Card className="border border-default-200/70 bg-content1">
            <Card.Content className="gap-3 p-4 sm:p-5">
              {submittedMaps.map((map) => (
                <SubmittedMapCard key={map.id} map={map} />
              ))}
            </Card.Content>
          </Card>
        ) : (
          <div className="rounded-3xl border border-dashed border-default-300 p-6 text-center text-sm text-default-500">
            Kamu belum mengajukan map.
          </div>
        )}
      </section>
    </div>
  );
}
