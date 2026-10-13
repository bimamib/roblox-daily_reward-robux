import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip } from "@heroui/react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getMapBySlug } from "@/lib/maps/queries";
import { AttendanceClient } from "@/components/attendance-client";

export default async function MapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const map = await getMapBySlug(slug);

  if (!map) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tracker = user
    ? await prisma.attendanceTracker.findFirst({
        where: {
          userId: user.id,
          mapId: map.id,
          status: { in: ["ACTIVE", "COMPLETED"] },
        },
        include: {
          attendanceLogs: { orderBy: { dayNumber: "asc" } },
          claims: { orderBy: { dayNumber: "asc" } },
        },
        orderBy: { cycleNumber: "desc" },
      })
    : null;

  const userRewards = user
    ? await prisma.userMapReward.findMany({
        where: { userId: user.id, mapId: map.id },
        orderBy: { dayNumber: "asc" },
      })
    : [];

  const publicRobuxTotal = map.rewards.reduce(
    (sum, reward) => sum + (reward.rewardType === "ROBUX" ? reward.amount : 0),
    0,
  );

  const personalRobuxTarget = userRewards.reduce(
    (sum, reward) => sum + (reward.rewardType === "ROBUX" ? reward.amount : 0),
    0,
  );

  const robuxSent = (tracker?.claims ?? []).reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus === "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const robuxPending = (tracker?.claims ?? []).reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus !== "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const target = user ? personalRobuxTarget : publicRobuxTotal;
  const robuxProgress =
    target > 0 ? Math.min(100, Math.round((robuxSent / target) * 100)) : 0;

  const initials = map.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-default-200 px-4 py-2 text-sm font-semibold text-default-600 transition hover:border-violet-400 hover:text-violet-500"
      >
        ← Kembali ke daftar map
      </Link>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-7">
        <div className="relative flex min-h-52 min-w-0 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950 via-violet-700 to-indigo-950 p-5 text-white shadow-lg sm:min-h-64 sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap gap-2">
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
            <Chip size="sm" variant="soft">
              {map.durationDays} hari
            </Chip>
          </div>

          <div className="relative mt-8">
            <div className="mb-3 flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black tracking-tight shadow-inner sm:size-20 sm:text-2xl">
              {initials}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
              Roblox reward map
            </p>
            <p className="mt-1 text-sm text-white/75">
              Fase {map.phaseNumber ?? 1}
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-default-200/70 bg-content1 p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-500">
            Detail map
          </p>

          <h1 className="mt-3 break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {map.name}
          </h1>

          <p className="mt-2 break-words text-sm text-default-500">
            Dibuat oleh {map.creatorName}
          </p>

          {map.description && (
            <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-default-600">
              {map.description}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-default-200 bg-default-50/60 p-4">
              <p className="text-xs text-default-500">
                {user ? "Target Robux pribadi" : "Total Robux publik"}
              </p>
              <p className="mt-1 break-words text-xl font-black text-success-600">
                {target.toLocaleString("id-ID")} R$
              </p>
            </div>

            <div className="rounded-2xl border border-default-200 bg-default-50/60 p-4">
              <p className="text-xs text-default-500">Robux terkirim</p>
              <p className="mt-1 break-words text-xl font-black">
                {robuxSent.toLocaleString("id-ID")} R$
              </p>
            </div>

            <div className="rounded-2xl border border-default-200 bg-default-50/60 p-4">
              <p className="text-xs text-default-500">Belum terkirim</p>
              <p className="mt-1 break-words text-xl font-black">
                {robuxPending.toLocaleString("id-ID")} R$
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">Progress Robux terkirim</span>
              <span className="font-bold">{robuxProgress}%</span>
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
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all"
                style={{ width: `${robuxProgress}%` }}
              />
            </div>
            {!user && (
              <p className="mt-2 text-xs text-default-500">
                Masuk untuk melihat target reward pribadi dan status klaim.
              </p>
            )}
            {user && personalRobuxTarget === 0 && (
              <p className="mt-2 text-xs text-default-500">
                Atur milestone Robux pribadi di bagian pengaturan reward.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 min-w-0">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-500">
            Attendance tracker
          </p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">
            Absensi harian
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-default-500">
            Atur reward pribadi, lakukan check-in sesuai urutan hari, dan
            perbarui status pengiriman Robux dari klaim yang tercatat.
          </p>
        </div>

        {user ? (
          <AttendanceClient
            map={{
              id: map.id,
              name: map.name,
              durationDays: map.durationDays,
            }}
            tracker={tracker}
            userRewards={userRewards.map((reward) => ({
              ...reward,
              description: reward.description ?? null,
            }))}
          />
        ) : (
          <div className="rounded-3xl border border-default-200 bg-content1 p-6 sm:p-8">
            <h3 className="text-lg font-bold">Masuk untuk mulai mencatat</h3>
            <p className="mt-2 text-sm leading-6 text-default-500">
              Pengaturan reward pribadi dan riwayat absensi hanya tersedia
              setelah kamu masuk ke akun.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Masuk ke akun
            </Link>
          </div>
        )}
      </section>

      {map.nextPhases.length > 0 && (
        <section className="mt-8 rounded-3xl border border-default-200 bg-content1 p-5 sm:p-7">
          <h2 className="text-xl font-black">Fase selanjutnya</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {map.nextPhases.map((phase) => (
              <span
                key={phase.id}
                className="rounded-full border border-default-200 px-4 py-2 text-sm font-semibold"
              >
                Fase {phase.phaseNumber}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
