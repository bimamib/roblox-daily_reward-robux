import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderActions } from "@/components/header-actions";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="text-xl font-black tracking-tight">
          Rbx<span className="text-violet-400">Daily</span>
        </Link>

        <nav className="hidden gap-2 md:flex">
          <HeaderActions />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <HeaderActions user={!!user} />
        </div>
      </div>
    </header>
  );
}
