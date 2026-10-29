"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { loginAction } from "@/actions/auth";
import { PasswordField } from "@/components/password-field";
import { cardClass, inputClass, skeuoButton } from "@/lib/ui";

interface LoginFormProps {
  error?: string;
}

export function LoginForm({ error }: LoginFormProps) {
  return (
    <form action={loginAction} className={`w-full space-y-5 ${cardClass}`}>
      <div>
        <h1 className="text-3xl font-black">Masuk</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          Masuk untuk mencatat absensi dan reward kamu.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <TextField name="email" type="email" isRequired>
        <Label>Email</Label>
        <Input
          className={inputClass}
          placeholder="Masukkan email"
          autoComplete="email"
        />
      </TextField>

      <PasswordField
        placeholder="Masukkan password"
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        className={`${skeuoButton("primary")} w-full`}
      >
        Login
      </Button>
    </form>
  );
}
