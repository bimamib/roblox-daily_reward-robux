import { prisma } from "@/lib/prisma";

interface GetActiveMapsOptions {
  search?: string;
  duration?: string;
}

export async function getActiveMaps({
  search,
  duration,
}: GetActiveMapsOptions = {}) {
  const trimmedSearch = search?.trim();

  const durationDays =
    duration && ["7", "14", "30"].includes(duration)
      ? Number(duration)
      : undefined;

  return prisma.map.findMany({
    where: {
      status: "ACTIVE",

      ...(trimmedSearch
        ? {
            OR: [
              {
                name: {
                  contains: trimmedSearch,
                  mode: "insensitive",
                },
              },
              {
                creatorName: {
                  contains: trimmedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),

      ...(durationDays
        ? {
            durationDays,
          }
        : {}),
    },

    include: {
      rewards: {
        orderBy: {
          dayNumber: "asc",
        },
      },

      nextPhases: {
        orderBy: {
          phaseNumber: "asc",
        },
      },
    },

    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function getMapBySlug(slug: string) {
  return prisma.map.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },

    include: {
      rewards: {
        orderBy: {
          dayNumber: "asc",
        },
      },

      parentMap: true,

      nextPhases: {
        orderBy: {
          phaseNumber: "asc",
        },
      },
    },
  });
}
