"use client";

import { Button, Input, Label, TextField } from "@heroui/react";
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

      <TextField name="email" type="email" isRequired>
        <Label>Email</Label>
        <Input placeholder="Masukkan email" />
      </TextField>

      <TextField name="password" type="password" isRequired>
        <Label>Password</Label>
        <Input placeholder="Masukkan password" />
      </TextField>

      <Button type="submit" variant="primary" className="w-full">
        Login
      </Button>
    </form>
  );
}
