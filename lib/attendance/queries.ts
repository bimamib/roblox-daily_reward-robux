import { prisma } from "@/lib/prisma";

export async function getCurrentTracker(userId: string, mapId: string) {
  return prisma.attendanceTracker.findFirst({
    where: { userId, mapId, status: "ACTIVE" },
    include: {
      claims: { include: { reward: true }, orderBy: { dayNumber: "asc" } },
    },
    orderBy: { cycleNumber: "desc" },
  });
}

export async function getUserDashboard(userId: string) {
  return prisma.attendanceTracker.findMany({
    where: { userId },
    include: { map: true, claims: { include: { reward: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getUserSubmittedMaps(userId: string) {
  return prisma.map.findMany({
    where: {
      submittedById: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
