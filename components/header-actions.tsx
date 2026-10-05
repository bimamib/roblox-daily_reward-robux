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
        <Button as={Link} href="/" variant="light">
          Maps
        </Button>

        <Button as={Link} href="/dashboard" variant="light">
          Dashboard
        </Button>

        <Button as={Link} href="/maps/submit" variant="light">
          Submit Map
        </Button>
      </>
    );
  }

  return user ? (
    <form action={logoutAction}>
      <Button type="submit" variant="flat">
        Logout
      </Button>
    </form>
  ) : (
    <Button as={Link} href="/login" className="skeuo-btn">
      Login
    </Button>
  );
}
