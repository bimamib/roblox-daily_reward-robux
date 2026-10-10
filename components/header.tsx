import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeaderActions } from "@/components/header-actions";

export async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-xl font-black leading-none tracking-tight"
          aria-label="RbxDaily - Beranda"
        >
          Rbx<span className="text-violet-400">Daily</span>
        </Link>

        {/* Area navigasi dengan scrollbar di bawah */}
        <div className="min-w-0 flex-1 self-stretch">
          <nav
            aria-label="Navigasi utama"
            className="flex h-full min-w-0 items-center"
          >
            <div className="flex h-full items-center gap-1 md:gap-2">
              <HeaderActions />
            </div>
          </nav>
        </div>

        {/* Akun tetap berada di sebelah kanan */}
        <div className="ml-auto flex shrink-0 items-center">
          <HeaderActions user={!!user} />
        </div>
      </div>
    </header>
  );
}
