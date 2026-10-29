"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { registerAction } from "@/actions/auth";
import { PasswordField } from "@/components/password-field";
import { cardClass, inputClass, skeuoButton } from "@/lib/ui";

interface RegisterFormProps {
  error?: string;
}

export function RegisterForm({ error }: RegisterFormProps) {
  return (
    <form action={registerAction} className={`w-full space-y-5 ${cardClass}`}>
      <div>
        <h1 className="text-3xl font-black">Buat akun</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          Daftar untuk mulai mencatat absensi dan reward kamu.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <TextField name="username" isRequired>
        <Label>Username</Label>
        <Input
          className={inputClass}
          placeholder="Masukkan username"
          autoComplete="username"
        />
      </TextField>

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
        autoComplete="new-password"
        minLength={8}
        hint="Minimal 8 karakter."
      />

      <Button
        type="submit"
        variant="primary"
        className={`${skeuoButton("primary")} w-full`}
      >
        Daftar
      </Button>
    </form>
  );
}
