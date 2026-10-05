"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function dateKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayNumber(date: Date, timeZone: string) {
  const key = dateKey(date, timeZone);
  const [year, month, day] = key.split("-").map(Number);

  return Date.UTC(year, month - 1, day);
}

function diffDays(a: Date, b: Date, timeZone: string) {
  return Math.floor(
    (dayNumber(a, timeZone) - dayNumber(b, timeZone)) / 86400000,
  );
}

export async function checkInAction(mapId: string) {
  const { user, profile } = await requireUser();

  const now = new Date();

  const map = await prisma.map.findUnique({
    where: {
      id: mapId,
    },
    include: {
      rewards: {
        orderBy: {
          dayNumber: "asc",
        },
      },
    },
  });

  if (!map || map.status !== "ACTIVE") {
    throw new Error("Map tidak tersedia.");
  }

  const result = await prisma.$transaction(async (tx) => {
    let tracker = await tx.attendanceTracker.findFirst({
      where: {
        userId: user.id,
        mapId,
        status: "ACTIVE",
      },
      orderBy: {
        cycleNumber: "desc",
      },
      include: {
        attendanceLogs: {
          orderBy: {
            dayNumber: "desc",
          },
        },
        claims: {
          include: {
            reward: true,
          },
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
    });

    /*
     * Jika user melewatkan lebih dari 1 hari,
     * cycle sebelumnya dianggap gagal.
     */
    if (
      tracker?.lastAttendanceAt &&
      diffDays(now, tracker.lastAttendanceAt, profile.timezone) > 1
    ) {
      await tx.attendanceTracker.update({
        where: {
          id: tracker.id,
        },
        data: {
          status: "ABANDONED",
          resetReason: "Attendance terlewat",
        },
      });

      tracker = null;
    }

    /*
     * Jika belum ada tracker aktif,
     * buat cycle baru.
     */
    if (!tracker) {
      const last = await tx.attendanceTracker.findFirst({
        where: {
          userId: user.id,
          mapId,
        },
        orderBy: {
          cycleNumber: "desc",
        },
      });

      tracker = await tx.attendanceTracker.create({
        data: {
          userId: user.id,
          mapId,
          cycleNumber: (last?.cycleNumber ?? 0) + 1,
        },
        include: {
          attendanceLogs: true,
          claims: {
            include: {
              reward: true,
            },
          },
        },
      });
    }

    /*
     * Cegah check-in dua kali pada
     * tanggal yang sama.
     */
    if (
      tracker.lastAttendanceAt &&
      diffDays(now, tracker.lastAttendanceAt, profile.timezone) === 0
    ) {
      throw new Error("Kamu sudah absen hari ini.");
    }

    /*
     * Tentukan hari berikutnya berdasarkan
     * AttendanceLog, bukan AttendanceClaim.
     *
     * AttendanceClaim hanya berisi milestone reward.
     */
    const lastAttendanceDay =
      tracker.attendanceLogs.length > 0
        ? Math.max(...tracker.attendanceLogs.map((log) => log.dayNumber))
        : 0;

    const nextDay = lastAttendanceDay + 1;

    /*
     * Pastikan tidak melewati durasi map.
     */
    if (nextDay > map.durationDays) {
      throw new Error(
        "Siklus absensi sudah selesai. Mulai ulang jika ingin siklus baru.",
      );
    }

    /*
     * Catat attendance setiap hari.
     *
     * Ini tetap dilakukan meskipun hari tersebut
     * tidak mempunyai reward.
     */
    await tx.attendanceLog.create({
      data: {
        trackerId: tracker.id,
        dayNumber: nextDay,
        checkedInAt: now,
      },
    });

    /*
     * Cari milestone reward untuk hari tersebut.
     */
    const reward = map.rewards.find((item) => item.dayNumber === nextDay);

    /*
     * AttendanceClaim hanya dibuat jika
     * hari tersebut memiliki reward.
     */
    if (reward) {
      await tx.attendanceClaim.create({
        data: {
          trackerId: tracker.id,
          rewardId: reward.id,
          dayNumber: nextDay,
          claimedAt: now,
          deliveryStatus:
            reward.rewardType === "ROBUX" ? "NOT_SENT" : "NOT_APPLICABLE",
        },
      });
    }

    /*
     * Tentukan apakah siklus sudah selesai.
     */
    const isCompleted = nextDay === map.durationDays;

    await tx.attendanceTracker.update({
      where: {
        id: tracker.id,
      },
      data: {
        lastAttendanceAt: now,
        status: isCompleted ? "COMPLETED" : "ACTIVE",
        completedAt: isCompleted ? now : null,
      },
    });

    return {
      day: nextDay,
      checkedInAt: now,
      reward: reward
        ? {
            id: reward.id,
            type: reward.rewardType,
            amount: reward.amount,
            title: reward.title,
          }
        : null,
      completed: isCompleted,
      reset: false,
    };
  });

  revalidatePath(`/maps/${map.slug}`);
  revalidatePath("/dashboard");

  return result;
}

/**
 * Memulai ulang tracking sebuah map.
 *
 * Cycle lama tidak dihapus agar history tetap tersimpan.
 */
export async function restartTrackerAction(mapId: string) {
  const { user } = await requireUser();

  const map = await prisma.map.findUnique({
    where: {
      id: mapId,
    },
    select: {
      id: true,
      slug: true,
      status: true,
    },
  });

  if (!map || map.status !== "ACTIVE") {
    throw new Error("Map tidak tersedia.");
  }

  await prisma.$transaction(async (tx) => {
    /*
     * Cari tracker aktif.
     */
    const active = await tx.attendanceTracker.findFirst({
      where: {
        userId: user.id,
        mapId,
        status: "ACTIVE",
      },
      orderBy: {
        cycleNumber: "desc",
      },
    });

    /*
     * Tandai cycle lama sebagai abandoned.
     *
     * AttendanceLog dan AttendanceClaim
     * tetap dipertahankan sebagai history.
     */
    if (active) {
      await tx.attendanceTracker.update({
        where: {
          id: active.id,
        },
        data: {
          status: "ABANDONED",
          resetReason: "Dimulai ulang oleh user",
        },
      });
    }

    /*
     * Ambil nomor cycle terakhir.
     */
    const last = await tx.attendanceTracker.findFirst({
      where: {
        userId: user.id,
        mapId,
      },
      orderBy: {
        cycleNumber: "desc",
      },
    });

    /*
     * Buat cycle baru.
     */
    await tx.attendanceTracker.create({
      data: {
        userId: user.id,
        mapId,
        cycleNumber: (last?.cycleNumber ?? 0) + 1,
      },
    });
  });

  revalidatePath(`/maps/${map.slug}`);
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

/**
 * User boleh mengubah status reward miliknya sendiri.
 *
 * User hanya bisa mengubah claim yang:
 * - dimiliki oleh dirinya
 * - merupakan reward ROBUX
 *
 * Tidak bisa mengubah reward user lain.
 */
export async function setDeliveryStatusAction(
  claimId: string,
  status: "NOT_SENT" | "PENDING" | "SENT",
) {
  const { user } = await requireUser();

  const claim = await prisma.attendanceClaim.findFirst({
    where: {
      id: claimId,
      tracker: {
        userId: user.id,
      },
      reward: {
        rewardType: "ROBUX",
      },
    },
    include: {
      tracker: {
        select: {
          mapId: true,
          map: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!claim) {
    throw new Error("Reward tidak ditemukan.");
  }

  await prisma.attendanceClaim.update({
    where: {
      id: claimId,
    },
    data: {
      deliveryStatus: status,
      deliveredAt: status === "SENT" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/maps/${claim.tracker.map.slug}`);

  return {
    success: true,
  };
}
