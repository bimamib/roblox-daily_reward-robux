"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";

export async function submitMapAction(formData: FormData) {
  const { user } = await requireUser();

  const name = String(formData.get("name") || "").trim();
  const creatorName = String(formData.get("creatorName") || "").trim();

  const robloxUrl = String(formData.get("robloxUrl") || "").trim();

  const description = String(formData.get("description") || "").trim();

  const durationDays = Number(formData.get("durationDays"));

  if (
    !name ||
    !creatorName ||
    !robloxUrl ||
    ![7, 14, 30].includes(durationDays)
  ) {
    throw new Error("Data map tidak valid.");
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
      robloxUrl,
      description: description || null,
      durationDays,

      // Langsung bisa digunakan user
      status: "ACTIVE",

      // Belum diverifikasi admin
      verificationStatus: "UNVERIFIED",

      publishedAt: new Date(),

      submittedById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/maps/submit");

  redirect("/maps/submit?success=1");
}

export async function deleteMapAction(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    throw new Error("ID map tidak ditemukan.");
  }

  await requireAdmin();

  await prisma.map.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin/maps");
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

  revalidatePath("/");
  revalidatePath("/admin/maps");
}
