import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { linkButton } from "@/lib/ui";
import { SubmitMapForm } from "@/components/submit-map-form";

export default async function SubmitMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();

  const q = await searchParams;

  // Map yang sama sudah ada -> arahkan pengguna memakai map tersebut.
  const duplicate = q.duplicate
    ? await prisma.map.findFirst({
        where: { slug: q.duplicate, status: "ACTIVE" },
        select: { name: true, slug: true },
      })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-12">
      <h1 className="text-3xl font-black sm:text-4xl">Tambahkan Map</h1>

      <p className="mt-2 text-[color:var(--text-muted)]">
        Map langsung bisa kamu pakai. Admin akan memverifikasinya agar tampil
        sebagai map terverifikasi.
      </p>

      {q.error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger"
        >
          {q.error}
        </div>
      )}

      {duplicate && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm"
        >
          <p className="font-semibold">Map ini sudah ada</p>
          <p className="mt-1 text-[color:var(--text-muted)]">
            Game tersebut sudah terdaftar sebagai “{duplicate.name}”. Kamu bisa
            langsung memakainya tanpa menambahkan map baru.
          </p>
          <Link
            href={`/maps/${encodeURIComponent(duplicate.slug)}`}
            className={`${linkButton("primary", "sm")} mt-3`}
          >
            Buka map
          </Link>
        </div>
      )}

      {q.success && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-success/20 bg-success/10 p-4 text-sm"
        >
          <p className="font-semibold text-success">
            Map berhasil ditambahkan dan sudah bisa kamu pakai.
          </p>
          <Link
            href={`/maps/${encodeURIComponent(q.success)}`}
            className={`${linkButton("primary", "sm")} mt-3`}
          >
            Buka map
          </Link>
        </div>
      )}

      <SubmitMapForm />
    </main>
  );
}
