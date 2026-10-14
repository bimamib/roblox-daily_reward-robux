import { requireUser } from "@/lib/auth";
import {
  getUserDashboard,
  getUserSubmittedMaps,
} from "@/lib/attendance/queries";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await requireUser();

  const [trackers, submittedMaps] = await Promise.all([
    getUserDashboard(user.id),
    getUserSubmittedMaps(user.id),
  ]);

  const mapIds = [...new Set(trackers.map((tracker) => tracker.mapId))];

  const userRewards = mapIds.length
    ? await prisma.userMapReward.findMany({
        where: {
          userId: user.id,
          mapId: { in: mapIds },
        },
        orderBy: { dayNumber: "asc" },
      })
    : [];

  const rewardsByMap = new Map<string, typeof userRewards>();

  for (const reward of userRewards) {
    const current = rewardsByMap.get(reward.mapId) ?? [];
    current.push(reward);
    rewardsByMap.set(reward.mapId, current);
  }

  const activeMaps = trackers.filter(
    (tracker) => tracker.status === "ACTIVE",
  ).length;

  const allClaims = trackers.flatMap((tracker) => tracker.claims);

  const sentRobux = allClaims.reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus === "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const outstandingRobux = allClaims.reduce(
    (sum, claim) =>
      sum +
      (claim.rewardType === "ROBUX" && claim.deliveryStatus !== "SENT"
        ? claim.rewardAmount
        : 0),
    0,
  );

  const targetRobux = userRewards.reduce(
    (sum, reward) => sum + (reward.rewardType === "ROBUX" ? reward.amount : 0),
    0,
  );

  const trackersWithRewards = trackers.map((tracker) => ({
    ...tracker,
    userRewards: rewardsByMap.get(tracker.mapId) ?? [],
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <DashboardClient
        profile={{
          displayName: user.displayName ?? user.username ?? "Pengguna",
          username: user.username ?? "",
        }}
        trackers={trackersWithRewards}
        submittedMaps={submittedMaps}
        stats={{
          activeMaps,
          targetRobux,
          outstandingRobux,
          sentRobux,
          pendingMilestones: allClaims.filter(
            (claim) =>
              claim.rewardType === "ROBUX" && claim.deliveryStatus !== "SENT",
          ).length,
        }}
      />
    </main>
  );
}
