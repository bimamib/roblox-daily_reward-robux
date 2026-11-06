"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { fail, type ActionFailure } from "@/lib/action-result";
import {
  backfillDates,
  formatDateTime,
  getCheckInStatus,
  safeTimeZone,
} from "@/lib/attendance/rules";

type RewardType = "ROBUX" | "COIN" | "ITEM" | "XP" | "SPIN" | "OTHER";
type DeliveryStatus = "NOT_SENT" | "PENDING" | "SENT";

function revalidateMap(slug: string) {
  revalidatePath(`/maps/${slug}`);
  revalidatePath("/dashboard");
}

/* ------------------------------------------------------------------ */
/* Reward pribadi                                                      */
/* ------------------------------------------------------------------ */

export async function saveUserMapRewardAction(input: {
  mapId: string;
  dayNumber: number;
  rewardType: RewardType;
  amount: number;
  title: string;
  description?: string;
}): Promise<{ ok: true } | ActionFailure> {
  const { user } = await requireUser();

  const day = Number(input.dayNumber);
  const amount = Number(input.amount);
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  if (!Number.isInteger(day) || day < 1) {
    return fail("Hari reward tidak valid.");
  }

  if (!Number.isInteger(amount) || amount < 0) {
    return fail("Nominal reward harus bilangan bulat minimal 0.");
  }

  if (!title) {
    return fail("Judul reward wajib diisi.");
  }

  const validTypes: RewardType[] = [
    "ROBUX",
    "COIN",
    "ITEM",
    "XP",
    "SPIN",
    "OTHER",
  ];

  if (!validTypes.includes(input.rewardType)) {
    return fail("Jenis reward tidak valid.");
  }

  const map = await prisma.map.findUnique({
    where: { id: input.mapId },
    select: { id: true, slug: true, status: true, durationDays: true },
  });

  if (!map || map.status !== "ACTIVE") {
    return fail("Map tidak tersedia.");
  }

  if (day > map.durationDays) {
    return fail("Hari reward melebihi durasi map.");
  }

  await prisma.userMapReward.upsert({
    where: {
      userId_mapId_dayNumber: {
        userId: user.id,
        mapId: map.id,
        dayNumber: day,
      },
    },
    create: {
      userId: user.id,
      mapId: map.id,
      dayNumber: day,
      rewardType: input.rewardType,
      amount,
      title,
      description,
    },
    update: {
      rewardType: input.rewardType,
      amount,
      title,
      description,
    },
  });

  revalidateMap(map.slug);
  return { ok: true };
}

export async function deleteUserMapRewardAction(
  mapId: string,
  day: number,
): Promise<{ ok: true } | ActionFailure> {
  const { user } = await requireUser();

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: { id: true, slug: true },
  });

  if (!map) return fail("Map tidak ditemukan.");

  // Menghapus konfigurasi tidak menghapus snapshot klaim yang sudah ada.
  await prisma.userMapReward.deleteMany({
    where: {
      userId: user.id,
      mapId,
      dayNumber: day,
    },
  });

  revalidateMap(map.slug);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Check-in                                                            */
/* ------------------------------------------------------------------ */

export async function checkInAction(
  mapId: string,
): Promise<{ ok: true; day: number; completed: boolean } | ActionFailure> {
  const { user, profile } = await requireUser();
  const now = new Date();
  const timeZone = safeTimeZone(profile.timezone);

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: {
      id: true,
      slug: true,
      status: true,
      durationDays: true,
      resetMode: true,
    },
  });

  if (!map || map.status !== "ACTIVE") {
    return fail("Map tidak tersedia.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let tracker = await tx.attendanceTracker.findFirst({
      where: { userId: user.id, mapId, status: "ACTIVE" },
      orderBy: { cycleNumber: "desc" },
      include: {
        attendanceLogs: { orderBy: { dayNumber: "desc" } },
      },
    });

    if (tracker) {
      // Keputusan boleh/tidaknya absen mengikuti aturan reset map ini.
      const status = getCheckInStatus(
        map.resetMode,
        tracker.lastAttendanceAt,
        now,
        timeZone,
      );

      if (status.state === "LOCKED") {
        return fail(
          `Kamu sudah absen. Check-in berikutnya tersedia ${formatDateTime(
            status.availableAt,
            timeZone,
          )}.`,
        );
      }

      if (status.state === "BROKEN") {
        // Streak terputus: riwayat lama disimpan, siklus baru dimulai dari Day 1.
        await tx.attendanceTracker.update({
          where: { id: tracker.id },
          data: {
            status: "ABANDONED",
            resetReason: "Attendance terlewat",
          },
        });
        tracker = null;
      }
    }

    if (!tracker) {
      const last = await tx.attendanceTracker.findFirst({
        where: { userId: user.id, mapId },
        orderBy: { cycleNumber: "desc" },
        select: { cycleNumber: true },
      });

      tracker = await tx.attendanceTracker.create({
        data: {
          userId: user.id,
          mapId,
          cycleNumber: (last?.cycleNumber ?? 0) + 1,
        },
        include: {
          attendanceLogs: true,
        },
      });
    }

    const lastAttendanceDay = tracker.attendanceLogs.length
      ? Math.max(...tracker.attendanceLogs.map((log) => log.dayNumber))
      : 0;

    const nextDay = lastAttendanceDay + 1;

    if (nextDay > map.durationDays) {
      return fail("Siklus absensi selesai. Mulai ulang untuk siklus baru.");
    }

    const reward = await tx.userMapReward.findUnique({
      where: {
        userId_mapId_dayNumber: {
          userId: user.id,
          mapId,
          dayNumber: nextDay,
        },
      },
    });

    await tx.attendanceLog.create({
      data: {
        trackerId: tracker.id,
        dayNumber: nextDay,
        checkedInAt: now,
      },
    });

    if (reward) {
      await tx.attendanceClaim.create({
        data: {
          trackerId: tracker.id,
          dayNumber: nextDay,
          rewardType: reward.rewardType,
          rewardAmount: reward.amount,
          rewardTitle: reward.title,
          rewardDescription: reward.description,
          deliveryStatus:
            reward.rewardType === "ROBUX" ? "NOT_SENT" : "NOT_APPLICABLE",
        },
      });
    }

    const completed = nextDay === map.durationDays;

    await tx.attendanceTracker.update({
      where: { id: tracker.id },
      data: {
        lastAttendanceAt: now,
        status: completed ? "COMPLETED" : "ACTIVE",
        completedAt: completed ? now : null,
      },
    });

    return { ok: true as const, day: nextDay, completed };
  });

  revalidateMap(map.slug);
  return result;
}

/* ------------------------------------------------------------------ */
/* Isi absensi sebelumnya (pengisian mundur)                           */
/* ------------------------------------------------------------------ */

/**
 * Untuk pengguna yang sudah menjalani map sebelum memakai RbxDaily.
 *
 * Contoh: sudah absen 6 hari dan terakhir kemarin pukul 20.30 ->
 * daysDone = 6, lastAttendanceAt = waktu itu. Sistem membuat log hari 1..6
 * (berurutan, satu hari per hari) dan menandainya "diisi manual".
 *
 * Aturan:
 *  - hanya jika siklus aktif belum punya absensi sama sekali,
 *  - jumlah hari 1..durasi map, waktu tidak boleh di masa depan,
 *  - streak harus masih hidup menurut aturan reset map (kalau sudah putus,
 *    mulai dari Day 1 lewat check-in biasa).
 */
export async function backfillAttendanceAction(input: {
  mapId: string;
  daysDone: number;
  /** ISO 8601 (mis. dari Date.toISOString()). */
  lastAttendanceAt: string;
}): Promise<{ ok: true; days: number } | ActionFailure> {
  const { user, profile } = await requireUser();
  const now = new Date();
  const timeZone = safeTimeZone(profile.timezone);

  const daysDone = Number(input.daysDone);
  const lastAt = new Date(input.lastAttendanceAt);

  if (!Number.isInteger(daysDone) || daysDone < 1) {
    return fail("Jumlah hari harus bilangan bulat minimal 1.");
  }

  if (Number.isNaN(lastAt.getTime())) {
    return fail("Waktu absen terakhir tidak valid.");
  }

  // Toleransi 2 menit untuk selisih jam perangkat.
  if (lastAt.getTime() > now.getTime() + 2 * 60 * 1000) {
    return fail("Waktu absen terakhir tidak boleh di masa depan.");
  }

  const map = await prisma.map.findUnique({
    where: { id: input.mapId },
    select: {
      id: true,
      slug: true,
      status: true,
      durationDays: true,
      resetMode: true,
    },
  });

  if (!map || map.status !== "ACTIVE") {
    return fail("Map tidak tersedia.");
  }

  if (daysDone > map.durationDays) {
    return fail(`Map ini hanya berdurasi ${map.durationDays} hari.`);
  }

  const status = getCheckInStatus(map.resetMode, lastAt, now, timeZone);

  if (status.state === "BROKEN") {
    return fail(
      `Dengan aturan reset map ini, streak sudah putus sejak ${formatDateTime(
        status.brokeAt,
        timeZone,
      )}. Mulai dari Day 1 lewat tombol check-in.`,
    );
  }

  const dates = backfillDates(map.resetMode, lastAt, daysDone, timeZone);
  const completed = daysDone === map.durationDays;

  const userRewards = await prisma.userMapReward.findMany({
    where: { userId: user.id, mapId: map.id },
  });

  const rewardByDay = new Map(
    userRewards.map((reward) => [reward.dayNumber, reward]),
  );

  const result = await prisma.$transaction(async (tx) => {
    let tracker = await tx.attendanceTracker.findFirst({
      where: { userId: user.id, mapId: map.id, status: "ACTIVE" },
      orderBy: { cycleNumber: "desc" },
    });

    if (tracker) {
      const logCount = await tx.attendanceLog.count({
        where: { trackerId: tracker.id },
      });

      if (logCount > 0) {
        return fail(
          "Siklus ini sudah punya absensi. Gunakan “Mulai Ulang Streak” dulu jika ingin mengisi dari awal.",
        );
      }
    } else {
      const last = await tx.attendanceTracker.findFirst({
        where: { userId: user.id, mapId: map.id },
        orderBy: { cycleNumber: "desc" },
        select: { cycleNumber: true },
      });

      tracker = await tx.attendanceTracker.create({
        data: {
          userId: user.id,
          mapId: map.id,
          cycleNumber: (last?.cycleNumber ?? 0) + 1,
          startedAt: dates[0],
        },
      });
    }

    await tx.attendanceLog.createMany({
      data: dates.map((checkedInAt, index) => ({
        trackerId: tracker.id,
        dayNumber: index + 1,
        checkedInAt,
        isBackfilled: true,
      })),
    });

    const claims = dates.flatMap((claimedAt, index) => {
      const reward = rewardByDay.get(index + 1);

      if (!reward) return [];

      return [
        {
          trackerId: tracker.id,
          dayNumber: index + 1,
          rewardType: reward.rewardType,
          rewardAmount: reward.amount,
          rewardTitle: reward.title,
          rewardDescription: reward.description,
          deliveryStatus:
            reward.rewardType === "ROBUX"
              ? ("NOT_SENT" as const)
              : ("NOT_APPLICABLE" as const),
          claimedAt,
        },
      ];
    });

    if (claims.length > 0) {
      await tx.attendanceClaim.createMany({ data: claims });
    }

    await tx.attendanceTracker.update({
      where: { id: tracker.id },
      data: {
        startedAt: dates[0],
        lastAttendanceAt: lastAt,
        status: completed ? "COMPLETED" : "ACTIVE",
        completedAt: completed ? lastAt : null,
      },
    });

    return { ok: true as const, days: daysDone };
  });

  revalidateMap(map.slug);
  return result;
}

/* ------------------------------------------------------------------ */
/* Siklus & klaim                                                      */
/* ------------------------------------------------------------------ */

export async function restartTrackerAction(
  mapId: string,
): Promise<{ ok: true } | ActionFailure> {
  const { user } = await requireUser();

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: { id: true, slug: true, status: true },
  });

  if (!map || map.status !== "ACTIVE") {
    return fail("Map tidak tersedia.");
  }

  await prisma.$transaction(async (tx) => {
    const active = await tx.attendanceTracker.findFirst({
      where: { userId: user.id, mapId, status: "ACTIVE" },
      orderBy: { cycleNumber: "desc" },
    });

    if (active) {
      await tx.attendanceTracker.update({
        where: { id: active.id },
        data: {
          status: "ABANDONED",
          resetReason: "Dimulai ulang oleh user",
        },
      });
    }

    const last = await tx.attendanceTracker.findFirst({
      where: { userId: user.id, mapId },
      orderBy: { cycleNumber: "desc" },
      select: { cycleNumber: true },
    });

    await tx.attendanceTracker.create({
      data: {
        userId: user.id,
        mapId,
        cycleNumber: (last?.cycleNumber ?? 0) + 1,
      },
    });
  });

  revalidateMap(map.slug);
  return { ok: true };
}

export async function setDeliveryStatusAction(
  claimId: string,
  status: DeliveryStatus,
): Promise<{ ok: true } | ActionFailure> {
  const { user } = await requireUser();

  const claim = await prisma.attendanceClaim.findFirst({
    where: {
      id: claimId,
      tracker: { userId: user.id },
      rewardType: "ROBUX",
    },
    include: {
      tracker: {
        select: {
          mapId: true,
          map: { select: { slug: true } },
        },
      },
    },
  });

  if (!claim) return fail("Klaim Robux tidak ditemukan.");

  await prisma.attendanceClaim.update({
    where: { id: claimId },
    data: {
      deliveryStatus: status,
      deliveredAt: status === "SENT" ? new Date() : null,
    },
  });

  revalidateMap(claim.tracker.map.slug);
  return { ok: true };
}

/**
 * Khusus development:
 * Menghapus seluruh riwayat absensi user untuk satu map.
 * Konfigurasi UserMapReward tetap dipertahankan.
 */
export async function resetMapProgressAction(
  mapId: string,
): Promise<{ ok: true } | ActionFailure> {
  if (process.env.NODE_ENV === "production") {
    return fail("Reset progres hanya tersedia di development.");
  }

  const { user } = await requireUser();

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: { id: true, slug: true },
  });

  if (!map) {
    return fail("Map tidak ditemukan.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.attendanceTracker.deleteMany({
      where: {
        userId: user.id,
        mapId: map.id,
      },
    });
  });

  revalidatePath(`/maps/${map.slug}`);
  revalidatePath("/dashboard");

  return { ok: true };
}
