import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) throw new Error("Profile belum tersedia.");
  return { user, profile };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.profile.role !== "ADMIN") redirect("/dashboard");
  return result;
}
