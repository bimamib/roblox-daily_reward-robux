import { requireUser } from "@/lib/auth";
import { SubmitMapForm } from "@/components/submit-map-form";

export default async function SubmitMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireUser();

  const q = await searchParams;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-black">Tambahkan Map</h1>

      <p className="mt-2 text-default-500">
        Map baru masuk antrean review admin sebelum tampil sebagai map aktif.
      </p>

      {q.success === "1" && (
        <div className="mt-6 rounded-xl border border-success/20 bg-success/10 p-4 text-sm text-success">
          Map berhasil dikirim dan sedang menunggu review admin.
        </div>
      )}

      <SubmitMapForm />
    </main>
  );
}
