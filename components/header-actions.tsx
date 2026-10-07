"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { logoutAction } from "@/actions/auth";

interface HeaderActionsProps {
  user?: boolean;
}

export function HeaderActions({ user }: HeaderActionsProps) {
  if (user === undefined) {
    return (
      <>
        <Link href="/">
          <Button variant="ghost">Maps</Button>
        </Link>

        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>

        <Link href="/maps/submit">
          <Button variant="ghost">Submit Map</Button>
        </Link>
      </>
    );
  }

  return user ? (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary">
        Logout
      </Button>
    </form>
  ) : (
    <Link href="/login">
      <Button className="skeuo-btn">Login</Button>
    </Link>
  );
}
