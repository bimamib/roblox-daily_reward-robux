import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4">
      <div className="w-full">
        <RegisterForm error={q.error} />

        <p className="mt-5 text-center text-sm text-default-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-violet-400">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
