"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { skeuoButton } from "@/lib/ui";

export function SkeuoButton(props: ButtonProps) {
  const extra = typeof props.className === "string" ? props.className : "";

  return <Button {...props} className={`${skeuoButton("primary")} ${extra}`} />;
}
