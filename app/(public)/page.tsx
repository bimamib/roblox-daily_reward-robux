import type { Metadata } from "next";
import { getActiveMaps } from "@/lib/maps/queries";
import { buildMetadata } from "@/lib/site";
import { MapCard } from "@/components/map-card";
import { HomeFilters } from "@/components/home-filters";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Kanonik "/" untuk semua variasi pencarian (?search=..&duration=..), supaya
// Google tidak menganggapnya sebagai halaman duplikat.
export const metadata: Metadata = buildMetadata({ path: "/" });

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    duration?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : "";

  const duration = typeof params.duration === "string" ? params.duration : "";

  const maps = await getActiveMaps({
    search,
    duration,
  });

  // The detail page displays the signed-in user's personal Robux target.
  // Use that same source on the home cards so both pages stay in sync.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const personalRewards =
    user && maps.length
      ? await prisma.userMapReward.findMany({
          where: { userId: user.id, mapId: { in: maps.map((map) => map.id) } },
          select: { mapId: true, rewardType: true, amount: true },
        })
      : [];
  const personalRobuxByMap = new Map<string, number>();
  for (const reward of personalRewards) {
    if (reward.rewardType === "ROBUX") {
      personalRobuxByMap.set(
        reward.mapId,
        (personalRobuxByMap.get(reward.mapId) ?? 0) + reward.amount,
      );
    }
  }

  return (
    <main>
      <section className="hero-grid border-b border-white/10">
        {/* Jarak atas & padding samping disamakan dengan halaman Dashboard
            (pt-7 sm:pt-10, px-4 sm:px-6). */}
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10">
          <p className="mb-4 text-base font-bold uppercase leading-4 tracking-[.2em] text-violet-400">
            Roblox Reward Tracker
          </p>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Jangan kehilangan streak reward Robux kamu.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-default-500">
            Cari map Roblox dengan absensi 7, 14, atau 30 hari. Catat tanggal
            dan jam hadir, pantau milestone Robux, dan tandai status
            pengirimannya.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <HomeFilters search={search} duration={duration} />

        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">Reward Maps</h2>

            <p className="text-sm text-default-500">
              {maps.length} map ditemukan
            </p>
          </div>
        </div>

        {maps.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {maps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                signedIn={!!user}
                personalRobuxTotal={personalRobuxByMap.get(map.id) ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-default-200 p-10 text-center">
            <h3 className="text-xl font-black">Map tidak ditemukan</h3>

            <p className="mt-2 text-sm text-default-500">
              Coba gunakan nama map, creator, atau durasi yang berbeda.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
