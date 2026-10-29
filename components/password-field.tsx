"use client";

import { useState } from "react";
import { Button, InputGroup, Label, TextField } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { inputGroupClass, inputGroupInputClass } from "@/lib/ui";

/**
 * Kolom password dengan tombol tampil/sembunyikan (HeroUI InputGroup).
 * Nilai dibaca form lewat atribut name="password", sama seperti TextField biasa.
 */
export function PasswordField({
  placeholder,
  autoComplete,
  minLength,
  hint,
}: {
  placeholder?: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField name="password" isRequired>
      <Label>Password</Label>

      <InputGroup className={inputGroupClass}>
        <InputGroup.Input
          className={inputGroupInputClass}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
        />

        <InputGroup.Suffix className="pe-1">
          <Button
            isIconOnly
            type="button"
            size="sm"
            variant="ghost"
            className="size-7 min-w-0 rounded-lg text-[color:var(--text-muted)]"
            aria-label={
              isVisible ? "Sembunyikan password" : "Tampilkan password"
            }
            onPress={() => setIsVisible((visible) => !visible)}
          >
            {isVisible ? (
              <Eye className="size-4" aria-hidden="true" />
            ) : (
              <EyeOff className="size-4" aria-hidden="true" />
            )}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>

      {hint && (
        <p className="mt-1 text-xs text-[color:var(--text-muted)]">{hint}</p>
      )}
    </TextField>
  );
}
