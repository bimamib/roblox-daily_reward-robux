import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

/**
 * Membersihkan data dari database yang ada di DATABASE_URL.
 *
 *   npx tsx prisma/clear-data.ts --demo --yes
 *       Hapus HANYA 6 map demo bawaan seed (slug: skyline-daily, dst.)
 *       beserta reward / absensi yang terkait dengan map tersebut.
 *
 *   npx tsx prisma/clear-data.ts --all --yes
 *       Hapus SEMUA map, reward, tracker, absensi, dan klaim.
 *       Akun (tabel profiles) TIDAK dihapus, jadi admin tetap bisa login.
 *
 * Tanpa --yes, skrip hanya menampilkan apa yang akan dilakukan.
 * Jangan jalankan --all ke database produksi yang sudah dipakai pengguna.
 */

const DEMO_SLUGS = [
  "skyline-daily",
  "castle-login-quest",
  "neon-city-rewards",
  "island-streak",
  "lucky-farm",
  "arena-login-pass",
];

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function databaseHost() {
  try {
    return new URL(process.env.DATABASE_URL ?? "").host || "(tidak diketahui)";
  } catch {
    return "(tidak diketahui)";
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes("--all")
    ? "all"
    : args.includes("--demo")
      ? "demo"
      : null;
  const confirmed = args.includes("--yes");

  if (!mode) {
    console.log("Pilih mode: --demo (hanya map demo) atau --all (semua data).");
    process.exitCode = 1;
    return;
  }

  console.log(`Database : ${databaseHost()}`);
  console.log(
    `Mode     : ${
      mode === "all"
        ? "HAPUS SEMUA map, reward, tracker, absensi, klaim"
        : `hapus ${DEMO_SLUGS.length} map demo`
    }`,
  );

  if (!confirmed) {
    console.log("\nDry run. Tambahkan --yes untuk benar-benar menghapus.");
    return;
  }

  if (mode === "demo") {
    const result = await prisma.map.deleteMany({
      where: { slug: { in: DEMO_SLUGS } },
    });
    console.log(`\nSelesai: ${result.count} map demo dihapus.`);
    return;
  }

  await prisma.$transaction([
    prisma.attendanceClaim.deleteMany(),
    prisma.attendanceLog.deleteMany(),
    prisma.attendanceTracker.deleteMany(),
    prisma.userMapReward.deleteMany(),
    prisma.mapChangeLog.deleteMany(),
    prisma.mapReward.deleteMany(),
    prisma.map.deleteMany(),
  ]);

  console.log("\nSelesai: semua data konten dihapus (akun tetap ada).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
