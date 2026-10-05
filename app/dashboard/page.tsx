import { requireUser } from "@/lib/auth";
import {
  getUserDashboard,
  getUserSubmittedMaps,
} from "@/lib/attendance/queries";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const { profile } = await requireUser();

  const trackers = await getUserDashboard(profile.id);

  const submittedMaps = await getUserSubmittedMaps(profile.id);

  const active = trackers.filter((tracker) => tracker.status === "ACTIVE");

  const pending = trackers
    .flatMap((tracker) => tracker.claims)
    .filter((claim) => claim.deliveryStatus === "PENDING");

  const sent = trackers
    .flatMap((tracker) => tracker.claims)
    .filter((claim) => claim.deliveryStatus === "SENT");

  const pendingRobux = pending.reduce(
    (sum, claim) => sum + claim.reward.amount,
    0,
  );

  const sentRobux = sent.reduce((sum, claim) => sum + claim.reward.amount, 0);

  return (
    <DashboardClient
      profile={{
        displayName: profile.displayName,
        username: profile.username,
      }}
      trackers={trackers}
      submittedMaps={submittedMaps}
      stats={{
        activeMaps: active.length,
        pendingRobux,
        sentRobux,
        pendingMilestones: pending.length,
      }}
    />
  );
}
