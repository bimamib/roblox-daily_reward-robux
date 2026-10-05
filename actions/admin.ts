"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function createMapAdminAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const creatorName = String(formData.get("creatorName") || "").trim();
  const robloxUrl = String(formData.get("robloxUrl") || "").trim();
  const durationDays = Number(formData.get("durationDays"));
  const phaseNumber = Number(formData.get("phaseNumber"));
  const parent = String(formData.get("parentMapId") || "none");
  if (!name || !creatorName || !robloxUrl || ![7,14,30].includes(durationDays)) throw new Error("Data map tidak valid.");
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}-${Date.now()}`;
  await prisma.map.create({ data: { name, slug, creatorName, robloxUrl, durationDays, phaseNumber, parentMapId: parent === "none" ? null : parent, status: "ACTIVE", verificationStatus: "VERIFIED", publishedAt: new Date(), lastVerifiedAt: new Date(), rewards: { create: Array.from({length:durationDays},(_,i)=>({dayNumber:i+1,rewardType:"OTHER",amount:0,title:"Regular Reward"})) } } });
  revalidatePath("/"); revalidatePath("/admin/maps");
}

export async function updateMapAdminAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.map.update({ where: { id }, data: { name: String(formData.get("name")), creatorName: String(formData.get("creatorName")), robloxUrl: String(formData.get("robloxUrl")), durationDays: Number(formData.get("durationDays")), phaseNumber: Number(formData.get("phaseNumber")) } });
  revalidatePath("/"); revalidatePath("/admin/maps");
}
