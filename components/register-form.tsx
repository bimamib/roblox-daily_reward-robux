"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
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

      <TextField name="username" isRequired>
        <Label>Username</Label>
        <Input />
      </TextField>

      <TextField name="email" type="email" isRequired>
        <Label>Email</Label>
        <Input />
      </TextField>

      <TextField name="password" type="password" isRequired>
        <Label>Password</Label>
        <Input minLength={8} />
      </TextField>

      <Button type="submit" className="skeuo-btn w-full">
        Daftar
      </Button>
    </form>
  );
}
