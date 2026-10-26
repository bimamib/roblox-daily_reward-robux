"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
import { registerAction } from "@/actions/auth";
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
        <Input className={inputClass} />
      </TextField>

      <TextField name="email" type="email" isRequired>
        <Label>Email</Label>
        <Input className={inputClass} />
      </TextField>

      <TextField name="password" type="password" isRequired>
        <Label>Password</Label>
        <Input className={inputClass} minLength={8} />
      </TextField>

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
