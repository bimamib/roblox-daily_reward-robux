"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { parseRobloxGameUrl, ROBLOX_URL_HINT } from "@/lib/roblox";
import type { ReportReason } from "@/app/generated/prisma/client";

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/maps");
  revalidatePath("/admin/reports");
}

/** Kembali ke form submit dengan pesan error (tanpa halaman error). */
function failSubmit(message: string): never {
  redirect(`/maps/submit?error=${encodeURIComponent(message)}`);
}

/* ------------------------------------------------------------------ */
/* Pengguna: tambah map                                                */
/* ------------------------------------------------------------------ */

export async function submitMapAction(formData: FormData) {
  const { user } = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const creatorName = String(formData.get("creatorName") || "").trim();
  const rawUrl = String(formData.get("robloxUrl") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const durationDays = Number(formData.get("durationDays"));

  if (!name || !creatorName) {
    failSubmit("Nama map dan creator wajib diisi.");
  }

  if (name.length > 80 || creatorName.length > 60) {
    failSubmit(
      "Nama map maksimal 80 karakter dan creator maksimal 60 karakter.",
    );
  }

  if (description.length > 1000) {
    failSubmit("Catatan maksimal 1000 karakter.");
  }

  if (![7, 14, 30].includes(durationDays)) {
    failSubmit("Durasi absensi harus 7, 14, atau 30 hari.");
  }

  // Hanya link game roblox.com yang diterima (anti-phishing).
  const parsed = parseRobloxGameUrl(rawUrl);

  if (!parsed) {
    failSubmit(`Link tidak valid. ${ROBLOX_URL_HINT}`);
  }

  // Cegah duplikat: satu game cukup satu map yang dipakai bersama.
  const existing = await prisma.map.findFirst({
    where: {
      OR: [{ robloxPlaceId: parsed.placeId }, { robloxUrl: parsed.url }],
    },
    select: { slug: true, status: true },
  });

  if (existing) {
    if (existing.status === "ACTIVE") {
      redirect(`/maps/submit?duplicate=${encodeURIComponent(existing.slug)}`);
    }

    failSubmit(
      "Map untuk game ini sudah terdaftar tetapi sedang tidak tersedia.",
    );
  }

  const slug = `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()}`;

  await prisma.map.create({
    data: {
      slug,
      name,
      creatorName,
      robloxUrl: parsed.url,
      robloxPlaceId: parsed.placeId,
      description: description || null,
      durationDays,

      // Langsung bisa digunakan user.
      status: "ACTIVE",

      // Belum diverifikasi admin.
      verificationStatus: "UNVERIFIED",

      publishedAt: new Date(),

      submittedById: user.id,
    },
  });

  revalidateCatalog();
  revalidatePath("/maps/submit");

  redirect(`/maps/submit?success=${encodeURIComponent(slug)}`);
}

/* ------------------------------------------------------------------ */
/* Pengguna: laporkan map                                              */
/* ------------------------------------------------------------------ */

const REPORT_REASONS: ReportReason[] = [
  "WRONG_URL",
  "SCAM",
  "INAPPROPRIATE",
  "DUPLICATE",
  "OTHER",
];

export async function reportMapAction(input: {
  mapId: string;
  reason: string;
  note?: string;
}) {
  const { user } = await requireUser();

  const reason = REPORT_REASONS.find((item) => item === input.reason);

  if (!reason) {
    throw new Error("Alasan laporan tidak valid.");
  }

  const note = input.note?.trim().slice(0, 500) || null;

  const map = await prisma.map.findUnique({
    where: { id: input.mapId },
    select: { id: true, status: true },
  });

  if (!map || map.status !== "ACTIVE") {
    throw new Error("Map tidak tersedia.");
  }

  const existing = await prisma.mapReport.findUnique({
    where: { mapId_reporterId: { mapId: map.id, reporterId: user.id } },
    select: { id: true, status: true },
  });

  if (existing && existing.status !== "OPEN") {
    throw new Error("Laporanmu untuk map ini sudah ditinjau admin.");
  }

  if (existing) {
    await prisma.mapReport.update({
      where: { id: existing.id },
      data: { reason, note },
    });
  } else {
    await prisma.mapReport.create({
      data: { mapId: map.id, reporterId: user.id, reason, note },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/maps");
  revalidatePath("/admin/reports");

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export async function deleteMapAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("ID map tidak ditemukan.");
  }

  await requireAdmin();

  await prisma.map.delete({
    where: { id },
  });

  revalidateCatalog();
}

export async function approveMapAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("ID map tidak ditemukan.");
  }

  await requireAdmin();

  await prisma.map.update({
    where: { id },
    data: {
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      publishedAt: new Date(),
      lastVerifiedAt: new Date(),
    },
  });

  revalidateCatalog();
}

/** Admin: aktifkan / nonaktifkan map (map nonaktif hilang dari katalog). */
export async function setMapStatusAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");

  if (!id) {
    throw new Error("ID map tidak ditemukan.");
  }

  if (status !== "ACTIVE" && status !== "INACTIVE") {
    throw new Error("Status map tidak valid.");
  }

  const { profile } = await requireAdmin();

  await prisma.$transaction([
    prisma.map.update({
      where: { id },
      data: { status },
    }),
    prisma.mapChangeLog.create({
      data: {
        mapId: id,
        adminId: profile.id,
        action: status === "INACTIVE" ? "MAP_DISABLED" : "MAP_ENABLED",
        description:
          status === "INACTIVE"
            ? "Map dinonaktifkan oleh admin."
            : "Map diaktifkan kembali oleh admin.",
      },
    }),
  ]);

  revalidateCatalog();
}

/** Admin: tandai map sebagai terverifikasi / belum diverifikasi. */
export async function setVerificationAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const verification = String(formData.get("verification") || "");

  if (!id) {
    throw new Error("ID map tidak ditemukan.");
  }

  if (verification !== "VERIFIED" && verification !== "UNVERIFIED") {
    throw new Error("Status verifikasi tidak valid.");
  }

  const { profile } = await requireAdmin();

  await prisma.$transaction([
    prisma.map.update({
      where: { id },
      data: {
        verificationStatus: verification,
        lastVerifiedAt: verification === "VERIFIED" ? new Date() : null,
      },
    }),
    prisma.mapChangeLog.create({
      data: {
        mapId: id,
        adminId: profile.id,
        action: verification === "VERIFIED" ? "MAP_VERIFIED" : "MAP_UNVERIFIED",
        description:
          verification === "VERIFIED"
            ? "Map ditandai terverifikasi oleh admin."
            : "Verifikasi map dicabut oleh admin.",
      },
    }),
  ]);

  revalidateCatalog();
}

/**
 * Admin: tindak lanjut laporan sebuah map.
 *  - resolution = "disable": map dinonaktifkan, laporan ditandai selesai.
 *  - resolution = "dismiss": laporan diabaikan, map tetap aktif.
 */
export async function resolveReportsAction(formData: FormData) {
  const mapId = String(formData.get("mapId") || "");
  const resolution = String(formData.get("resolution") || "");

  if (!mapId) {
    throw new Error("ID map tidak ditemukan.");
  }

  if (resolution !== "disable" && resolution !== "dismiss") {
    throw new Error("Tindakan tidak valid.");
  }

  const { profile } = await requireAdmin();
  const now = new Date();

  if (resolution === "disable") {
    await prisma.$transaction([
      prisma.map.update({
        where: { id: mapId },
        data: { status: "INACTIVE" },
      }),
      prisma.mapReport.updateMany({
        where: { mapId, status: "OPEN" },
        data: { status: "RESOLVED", resolvedAt: now },
      }),
      prisma.mapChangeLog.create({
        data: {
          mapId,
          adminId: profile.id,
          action: "MAP_DISABLED",
          description:
            "Map dinonaktifkan setelah ditinjau dari laporan pengguna.",
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.mapReport.updateMany({
        where: { mapId, status: "OPEN" },
        data: { status: "DISMISSED", resolvedAt: now },
      }),
      prisma.mapChangeLog.create({
        data: {
          mapId,
          adminId: profile.id,
          action: "REPORTS_DISMISSED",
          description: "Laporan pengguna diabaikan oleh admin.",
        },
      }),
    ]);
  }

  revalidateCatalog();
}
