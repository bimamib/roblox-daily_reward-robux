import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateMapAdminAction } from "@/actions/admin";
import { saveRewardsAction } from "@/actions/rewards";
import { AdminMapEditForm } from "@/components/admin-map-edit-form";

export default async function EditMapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const map = await prisma.map.findUnique({
    where: { id },
    include: {
      rewards: {
        orderBy: {
          dayNumber: "asc",
        },
      },
    },
  });

  if (!map) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-black">Edit {map.name}</h1>

      <AdminMapEditForm
        map={{
          id: map.id,
          name: map.name,
          creatorName: map.creatorName,
          robloxUrl: map.robloxUrl,
          durationDays: map.durationDays,
          phaseNumber: map.phaseNumber,
        }}
        rewards={map.rewards.map((reward) => ({
          id: reward.id,
          dayNumber: reward.dayNumber,
          amount: reward.amount,
          title: reward.title,
        }))}
        updateMapAdminAction={updateMapAdminAction}
        saveRewardsAction={saveRewardsAction}
      />
    </main>
  );
}
