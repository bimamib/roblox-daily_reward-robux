import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminActions } from "@/components/admin-actions";

export default async function AdminPage() {
  await requireAdmin();

  const [maps, users, unverified, reports] = await Promise.all([
    prisma.map.count(),
    prisma.profile.count(),
    prisma.map.count({
      where: { status: "ACTIVE", verificationStatus: "UNVERIFIED" },
    }),
    prisma.mapReport.count({
      where: { status: "OPEN" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black sm:text-4xl">Admin</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Maps" value={maps} />
        <Stat label="Users" value={users} />
        <Stat label="Belum diverifikasi" value={unverified} />
        <Stat label="Laporan terbuka" value={reports} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <AdminActions />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
