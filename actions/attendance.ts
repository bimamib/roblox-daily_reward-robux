"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

type RewardType = "ROBUX" | "COIN" | "ITEM" | "XP" | "SPIN" | "OTHER";
type DeliveryStatus = "NOT_SENT" | "PENDING" | "SENT";

function dateKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayNumber(date: Date, timeZone: string) {
  const [year, month, day] = dateKey(date, timeZone).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function diffDays(a: Date, b: Date, timeZone: string) {
  return Math.floor(
    (dayNumber(a, timeZone) - dayNumber(b, timeZone)) / 86400000,
  );
}

function revalidateMap(slug: string) {
  revalidatePath(`/maps/${slug}`);
  revalidatePath("/dashboard");
}

export async function saveUserMapRewardAction(input: {
  mapId: string;
  dayNumber: number;
  rewardType: RewardType;
  amount: number;
  title: string;
  description?: string;
}) {
  const { user } = await requireUser();

  const day = Number(input.dayNumber);
  const amount = Number(input.amount);
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  if (!Number.isInteger(day) || day < 1) {
    throw new Error("Hari reward tidak valid.");
  }

  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Nominal reward harus bilangan bulat minimal 0.");
  }

  if (!title) {
    throw new Error("Judul reward wajib diisi.");
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
    throw new Error("Jenis reward tidak valid.");
  }

  const map = await prisma.map.findUnique({
    where: { id: input.mapId },
    select: { id: true, slug: true, status: true, durationDays: true },
  });

  if (!map || map.status !== "ACTIVE") {
    throw new Error("Map tidak tersedia.");
  }

  if (day > map.durationDays) {
    throw new Error("Hari reward melebihi durasi map.");
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
  return { success: true };
}

export async function deleteUserMapRewardAction(mapId: string, day: number) {
  const { user } = await requireUser();

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: { id: true, slug: true },
  });

  if (!map) throw new Error("Map tidak ditemukan.");

  // Menghapus konfigurasi tidak menghapus snapshot klaim yang sudah ada.
  await prisma.userMapReward.deleteMany({
    where: {
      userId: user.id,
      mapId,
      dayNumber: day,
    },
  });

  revalidateMap(map.slug);
  return { success: true };
}

export async function checkInAction(mapId: string) {
  const { user, profile } = await requireUser();
  const now = new Date();

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: {
      id: true,
      slug: true,
      status: true,
      durationDays: true,
    },
  });

  if (!map || map.status !== "ACTIVE") {
    throw new Error("Map tidak tersedia.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let tracker = await tx.attendanceTracker.findFirst({
      where: { userId: user.id, mapId, status: "ACTIVE" },
      orderBy: { cycleNumber: "desc" },
      include: {
        attendanceLogs: { orderBy: { dayNumber: "desc" } },
      },
    });

    if (
      tracker?.lastAttendanceAt &&
      diffDays(now, tracker.lastAttendanceAt, profile.timezone) > 1
    ) {
      await tx.attendanceTracker.update({
        where: { id: tracker.id },
        data: {
          status: "ABANDONED",
          resetReason: "Attendance terlewat",
        },
      });
      tracker = null;
    }

    if (
      tracker?.lastAttendanceAt &&
      diffDays(now, tracker.lastAttendanceAt, profile.timezone) === 0
    ) {
      throw new Error("Kamu sudah absen hari ini.");
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
      throw new Error("Siklus absensi selesai. Mulai ulang untuk siklus baru.");
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

    return {
      day: nextDay,
      completed,
      reward: reward
        ? {
            type: reward.rewardType,
            amount: reward.amount,
            title: reward.title,
          }
        : null,
    };
  });

  revalidateMap(map.slug);
  return result;
}

export async function restartTrackerAction(mapId: string) {
  const { user } = await requireUser();

  const map = await prisma.map.findUnique({
    where: { id: mapId },
    select: { id: true, slug: true, status: true },
  });

  if (!map || map.status !== "ACTIVE") {
    throw new Error("Map tidak tersedia.");
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
  return { success: true };
}

export async function setDeliveryStatusAction(
  claimId: string,
  status: DeliveryStatus,
) {
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

  if (!claim) throw new Error("Klaim Robux tidak ditemukan.");

  await prisma.attendanceClaim.update({
    where: { id: claimId },
    data: {
      deliveryStatus: status,
      deliveredAt: status === "SENT" ? new Date() : null,
    },
  });

  revalidateMap(claim.tracker.map.slug);
  return { success: true };
}
