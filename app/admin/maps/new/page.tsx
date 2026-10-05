import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminMapNewForm } from "@/components/admin-map-new-form";

export default async function NewMapPage() {
  await requireAdmin();

  const parents = await prisma.map.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl font-black">Create Map</h1>

      <AdminMapNewForm parents={parents} />
    </main>
  );
}
