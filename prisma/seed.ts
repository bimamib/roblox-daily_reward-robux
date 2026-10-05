import { PrismaClient, MapStatus, RewardType, VerificationStatus } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const seeds = [
  { slug: "skyline-daily", name: "Skyline Daily", creatorName: "Nova Studio", days: 7, verified: true, rewards: [5,0,0,10,0,0,25] },
  { slug: "castle-login-quest", name: "Castle Login Quest", creatorName: "Pixel Forge", days: 14, verified: true, rewards: [0,5,0,0,10,0,0,0,15,0,0,0,0,50] },
  { slug: "neon-city-rewards", name: "Neon City Rewards", creatorName: "Orbit Works", days: 30, verified: false, rewards: [0,0,5,0,0,0,10,0,0,0,0,0,15,0,0,0,0,0,25,0,0,0,0,0,0,0,0,0,0,100] },
  { slug: "island-streak", name: "Island Streak", creatorName: "Wave Lab", days: 7, verified: true, rewards: [0,0,5,0,10,0,20] },
  { slug: "lucky-farm", name: "Lucky Farm", creatorName: "Green Pixel", days: 14, verified: false, rewards: [5,0,0,0,0,10,0,0,0,0,25,0,0,40] },
  { slug: "arena-login-pass", name: "Arena Login Pass", creatorName: "Arcade House", days: 30, verified: true, rewards: [0,0,0,0,5,0,0,0,0,10,0,0,0,0,0,0,20,0,0,0,0,0,0,0,0,0,0,0,0,75] },
];

async function main() {
  for (const item of seeds) {
    await prisma.map.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        slug: item.slug,
        name: item.name,
        description: "Data demo RbxDaily. Verifikasi reward dilakukan oleh admin.",
        creatorName: item.creatorName,
        robloxUrl: "https://www.roblox.com/",
        durationDays: item.days,
        phaseNumber: 1,
        status: MapStatus.ACTIVE,
        verificationStatus: item.verified ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED,
        publishedAt: new Date(),
        rewards: {
          create: item.rewards.map((amount, i) => ({
            dayNumber: i + 1,
            rewardType: amount > 0 ? RewardType.ROBUX : RewardType.OTHER,
            amount,
            title: amount > 0 ? `${amount} Robux` : "Regular Reward",
            description: amount > 0 ? `Milestone Robux hari ${i + 1}.` : "Reward harian non-Robux."
          }))
        }
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
