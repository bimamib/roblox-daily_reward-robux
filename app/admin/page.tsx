import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminActions } from "@/components/admin-actions";

export default async function AdminPage() {
  await requireAdmin();

  const [maps, users, pending] = await Promise.all([
    prisma.map.count(),
    prisma.profile.count(),
    prisma.map.count({
      where: { status: "PENDING_REVIEW" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-black">Admin</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Maps" value={maps} />
        <Stat label="Users" value={users} />
        <Stat label="Pending review" value={pending} />
      </div>

      <div className="mt-8 flex gap-3">
        <AdminActions />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
      <p className="text-sm text-default-500">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
