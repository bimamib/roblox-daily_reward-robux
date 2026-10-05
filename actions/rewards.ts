"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function saveRewardsAction(mapId: string, rewards: { dayNumber: number; amount: number; title: string; rewardType: "ROBUX"|"OTHER" }[]) {
  const { profile } = await requireAdmin();
  const map = await prisma.map.findUnique({ where: { id: mapId } });
  if (!map) throw new Error("Map tidak ditemukan.");
  await prisma.$transaction(async tx => {
    await tx.mapReward.deleteMany({ where: { mapId } });
    await tx.mapReward.createMany({ data: rewards.map(r => ({ mapId, dayNumber: r.dayNumber, amount: r.amount, title: r.title, rewardType: r.rewardType })) });
    await tx.mapChangeLog.create({ data: { mapId, adminId: profile.id, action: "REWARDS_UPDATED", description: `Updated ${rewards.length} daily rewards.` } });
  });
  revalidatePath(`/maps/${map.slug}`);
  revalidatePath("/admin/maps");
}
