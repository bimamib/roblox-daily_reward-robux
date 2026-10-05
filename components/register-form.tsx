"use client";

import { Input, Button } from "@heroui/react";
import { registerAction } from "@/actions/auth";

interface RegisterFormProps {
  error?: string;
}

export function RegisterForm({ error }: RegisterFormProps) {
  return (
    <form
      action={registerAction}
      className="w-full space-y-5 rounded-3xl border border-white/10 bg-white/[.03] p-7"
    >
      <h1 className="text-3xl font-black">Buat akun</h1>

      {error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Input name="username" label="Username" isRequired />

      <Input name="email" type="email" label="Email" isRequired />

      <Input
        name="password"
        type="password"
        label="Password"
        minLength={8}
        isRequired
      />

      <Button type="submit" className="skeuo-btn w-full">
        Daftar
      </Button>
    </form>
  );
}
