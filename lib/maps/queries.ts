import { prisma } from "@/lib/prisma";

export async function getActiveMaps() {
  return prisma.map.findMany({
    where: { status: "ACTIVE" },
    include: {
      rewards: { orderBy: { dayNumber: "asc" } },
      nextPhases: { orderBy: { phaseNumber: "asc" } },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getMapBySlug(slug: string) {
  return prisma.map.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      rewards: { orderBy: { dayNumber: "asc" } },
      parentMap: true,
      nextPhases: { orderBy: { phaseNumber: "asc" } },
    },
  });
}
