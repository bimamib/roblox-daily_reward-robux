/**
 * Hasil server action yang aman untuk produksi.
 *
 * Di produksi, Next.js menyamarkan pesan dari `throw new Error("...")` pada
 * server action menjadi pesan umum. Karena itu kesalahan yang BISA diduga
 * (validasi, aturan absensi) dikembalikan sebagai nilai, bukan dilempar,
 * supaya pesan yang jelas sampai ke pengguna.
 */
export type ActionFailure = { ok: false; error: string };

export function fail(error: string): ActionFailure {
  return { ok: false, error };
}

export function isActionFailure(value: unknown): value is ActionFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { ok?: unknown }).ok === false &&
    typeof (value as { error?: unknown }).error === "string"
  );
}
