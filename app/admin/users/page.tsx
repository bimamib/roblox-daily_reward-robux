import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage(){ await requireAdmin(); const users=await prisma.profile.findMany({orderBy:{createdAt:"desc"}}); return <main className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-4xl font-black">Users</h1><div className="mt-6 space-y-2">{users.map(u=><div key={u.id} className="rounded-xl border border-white/10 p-4"><b>{u.displayName ?? u.username}</b><span className="ml-3 text-sm text-default-500">{u.role}</span></div>)}</div></main> }
