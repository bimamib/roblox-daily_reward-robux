import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { loginAction } from "@/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4">
      <div className="w-full">
        <LoginForm error={q.error} />

        <p className="mt-5 text-center text-sm text-default-500">
          Belum punya akun?{" "}
          <Link href="/register" className="text-violet-400">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  );
}
