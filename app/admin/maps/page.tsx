import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminMapsClient } from "@/components/admin-maps-client";

export default async function AdminMapsPage() {
  await requireAdmin();

  const maps = await prisma.map.findMany({
    include: {
      rewards: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <AdminMapsClient maps={maps} />
    </main>
  );
}
