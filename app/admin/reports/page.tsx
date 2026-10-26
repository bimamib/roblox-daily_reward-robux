import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AdminReportsClient,
  type ReportGroup,
} from "@/components/admin-reports-client";

export default async function AdminReportsPage() {
  await requireAdmin();

  const reports = await prisma.mapReport.findMany({
    where: { status: "OPEN" },
    include: {
      map: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          robloxUrl: true,
        },
      },
      reporter: {
        select: { username: true, displayName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Kelompokkan laporan per map.
  const groups = new Map<string, ReportGroup>();

  for (const report of reports) {
    const group = groups.get(report.map.id) ?? {
      map: report.map,
      reports: [],
    };

    group.reports.push({
      id: report.id,
      reason: report.reason,
      note: report.note,
      createdAt: report.createdAt.toISOString(),
      reporter:
        report.reporter.displayName ?? report.reporter.username ?? "Pengguna",
    });

    groups.set(report.map.id, group);
  }

  // Map dengan laporan terbanyak di atas.
  const sorted = [...groups.values()].sort(
    (a, b) => b.reports.length - a.reports.length,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <AdminReportsClient groups={sorted} />
    </main>
  );
}
