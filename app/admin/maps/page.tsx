import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminMapsClient } from "@/components/admin-maps-client";

export default async function AdminMapsPage() {
  await requireAdmin();

  const rows = await prisma.map.findMany({
    include: {
      rewards: true,
      _count: {
        select: { reports: { where: { status: "OPEN" } } },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const maps = rows.map(({ _count, ...map }) => ({
    ...map,
    openReports: _count.reports,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <AdminMapsClient maps={maps} />
    </main>
  );
}
