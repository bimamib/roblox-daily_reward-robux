"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_RESET_MODE, isResetMode } from "@/lib/attendance/rules";

export async function createMapAdminAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const creatorName = String(formData.get("creatorName") || "").trim();
  const robloxUrl = String(formData.get("robloxUrl") || "").trim();
  const durationDays = Number(formData.get("durationDays"));
  const phaseNumber = Number(formData.get("phaseNumber"));
  const parent = String(formData.get("parentMapId") || "none");
  const resetMode = String(formData.get("resetMode") || DEFAULT_RESET_MODE);
  if (
    !name ||
    !creatorName ||
    !robloxUrl ||
    ![7, 14, 30].includes(durationDays) ||
    !isResetMode(resetMode)
  )
    throw new Error("Data map tidak valid.");
  const slug = `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()}`;
  await prisma.map.create({
    data: {
      name,
      slug,
      creatorName,
      robloxUrl,
      durationDays,
      resetMode,
      phaseNumber,
      parentMapId: parent === "none" ? null : parent,
      status: "ACTIVE",
      verificationStatus: "VERIFIED",
      publishedAt: new Date(),
      lastVerifiedAt: new Date(),
      rewards: {
        create: Array.from({ length: durationDays }, (_, i) => ({
          dayNumber: i + 1,
          rewardType: "OTHER",
          amount: 0,
          title: "Regular Reward",
        })),
      },
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/maps");
}

export async function updateMapAdminAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const creatorName = String(formData.get("creatorName") || "").trim();
  const robloxUrl = String(formData.get("robloxUrl") || "").trim();
  const durationDays = Number(formData.get("durationDays"));
  const phaseNumber = Number(formData.get("phaseNumber"));
  const resetMode = String(formData.get("resetMode") || "");
  const rawParent = String(formData.get("parentMapId") || "none");
  if (
    !id ||
    !name ||
    !creatorName ||
    !robloxUrl ||
    ![7, 14, 30].includes(durationDays) ||
    !Number.isInteger(phaseNumber) ||
    phaseNumber < 1 ||
    !isResetMode(resetMode)
  )
    throw new Error("Data map tidak valid.");

  // Parent phase: map ini menjadi fase lanjutan dari map yang dipilih.
  let parentMapId: string | null = null;

  if (rawParent !== "none") {
    if (rawParent === id) {
      throw new Error("Map tidak bisa menjadi fase dari dirinya sendiri.");
    }

    // Telusuri rantai induk calon parent; tidak boleh bertemu map ini
    // (jika ya, rantai fase akan berputar).
    let cursor: string | null = rawParent;

    for (let depth = 0; cursor && depth < 20; depth++) {
      if (cursor === id) {
        throw new Error("Pilihan parent membuat rantai fase berputar.");
      }

      const node: { parentMapId: string | null } | null =
        await prisma.map.findUnique({
          where: { id: cursor },
          select: { parentMapId: true },
        });

      if (!node) throw new Error("Parent phase tidak ditemukan.");

      cursor = node.parentMapId;
    }

    parentMapId = rawParent;
  }

  await prisma.map.update({
    where: { id },
    data: {
      name,
      creatorName,
      robloxUrl,
      durationDays,
      phaseNumber,
      resetMode,
      parentMapId,
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/maps");
  revalidatePath(`/admin/maps/${id}/edit`);
}
