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
        <Link href="/" className="shrink-0">
          <Button variant="ghost" className="whitespace-nowrap font-medium">
            Maps
          </Button>
        </Link>

        <Link href="/dashboard" className="shrink-0">
          <Button variant="ghost" className="whitespace-nowrap font-medium">
            Dashboard
          </Button>
        </Link>

        <Link href="/maps/submit" className="shrink-0">
          <Button variant="ghost" className="whitespace-nowrap font-medium">
            Submit Map
          </Button>
        </Link>
      </>
    );
  }

  return user ? (
    <form action={logoutAction} className="shrink-0">
      <Button type="submit" variant="secondary" className="whitespace-nowrap">
        Logout
      </Button>
    </form>
  ) : (
    <Link href="/login" className="shrink-0">
      <Button className="skeuo-btn whitespace-nowrap">Login</Button>
    </Link>
  );
}
