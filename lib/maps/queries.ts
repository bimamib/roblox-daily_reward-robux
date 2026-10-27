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

  const maps = await prisma.map.findMany({
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

  // Map terverifikasi tampil lebih dulu. Array.sort bersifat stabil, jadi
  // urutan terbaru-dulu tetap terjaga di dalam masing-masing kelompok.
  const rank = (status: string) => (status === "VERIFIED" ? 1 : 0);

  return [...maps].sort(
    (a, b) => rank(b.verificationStatus) - rank(a.verificationStatus),
  );
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
