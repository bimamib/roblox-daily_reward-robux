"use client";

import { Input, Button } from "@heroui/react";
import { loginAction } from "@/actions/auth";

interface LoginFormProps {
  error?: string;
}

export function LoginForm({ error }: LoginFormProps) {
  return (
    <form action={loginAction} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="Masukkan email"
        isRequired
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Masukkan password"
        isRequired
      />

      <Button type="submit" color="primary" className="w-full">
        Login
      </Button>
    </form>
  );
}
