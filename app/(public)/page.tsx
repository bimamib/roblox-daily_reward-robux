import { getActiveMaps } from "@/lib/maps/queries";
import { MapCard } from "@/components/map-card";
import { HomeFilters } from "@/components/home-filters";

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

  return (
    <main>
      <section className="hero-grid border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="mb-3 font-bold uppercase tracking-[.2em] text-violet-400">
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

      <section className="mx-auto max-w-6xl px-4 py-10">
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
              <MapCard key={map.id} map={map} />
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
