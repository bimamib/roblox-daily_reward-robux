import { notFound } from "next/navigation";
import { getMapBySlug } from "@/lib/maps/queries";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "@/components/attendance-client";

export default async function MapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const map = await getMapBySlug(slug);
  if (!map) notFound();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tracker = user
    ? await prisma.attendanceTracker.findFirst({
        where: {
          userId: user.id,
          mapId: map.id,
          status: "ACTIVE",
        },
        include: {
          attendanceLogs: {
            orderBy: { dayNumber: "asc" },
          },
          claims: {
            include: { reward: true },
            orderBy: { dayNumber: "asc" },
          },
        },
        orderBy: { cycleNumber: "desc" },
      })
    : null;
  const total = map.rewards.reduce(
    (s, r) => s + (r.rewardType === "ROBUX" ? r.amount : 0),
    0,
  );
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div className="map-cover min-h-[300px] rounded-3xl">
          <span className="map-initial">
            {map.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-default-100 px-3 py-1 text-sm">
              Phase {map.phaseNumber}
            </span>

            <span className="rounded-full bg-success/10 px-3 py-1 text-sm text-success">
              {map.verificationStatus}
            </span>

            <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary">
              {total} R$
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-black">{map.name}</h1>
          <p className="mt-2 text-default-500">by {map.creatorName}</p>
          <p className="mt-5 text-default-500">{map.description}</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5">
            <h2 className="mb-4 text-xl font-black">
              Absensi {map.durationDays} Hari
            </h2>
            {user ? (
              <AttendanceClient map={map} tracker={tracker} />
            ) : (
              <p className="text-default-500">
                Login terlebih dahulu untuk mulai mencatat absensi.
              </p>
            )}
          </div>
          {map.nextPhases.length > 0 && (
            <div className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5">
              <h2 className="font-black">Phase berikutnya</h2>
              {map.nextPhases.map((p) => (
                <p key={p.id} className="mt-2">
                  Phase {p.phaseNumber}: {p.name}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
