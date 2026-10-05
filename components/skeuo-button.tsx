"use client";
import { Button, type ButtonProps } from "@heroui/react";

export function SkeuoButton(props: ButtonProps) {
  return <Button {...props} className={`skeuo-btn ${props.className ?? ""}`} />;
}
