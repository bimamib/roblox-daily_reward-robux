"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Gift,
  LayoutDashboard,
  ListChecks,
  LogIn,
  LogOut,
  Map as MapIcon,
  PanelLeft,
  SquarePlus,
  ShieldCheck,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export type Viewer = {
  displayName: string;
  username: string | null;
  role: "USER" | "ADMIN";
} | null;

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const mainNav: NavItem[] = [
  { href: "/", label: "Maps", icon: MapIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/maps/submit", label: "Submit Map", icon: SquarePlus },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: ShieldCheck },
  { href: "/admin/maps", label: "Kelola Maps", icon: ListChecks },
  { href: "/admin/users", label: "Users", icon: Users },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return (
      pathname === "/" ||
      (pathname.startsWith("/maps") && !pathname.startsWith("/maps/submit"))
    );
  }

  if (href === "/admin") return pathname === "/admin";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="sb-item"
      aria-current={active ? "page" : undefined}
      title={item.label}
    >
      <Icon className="sb-icon" aria-hidden="true" />
      <span className="sb-label">{item.label}</span>
    </Link>
  );
}

export function AppShell({
  viewer,
  children,
}: {
  viewer: Viewer;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup drawer mobile setiap kali pindah halaman.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Tutup drawer dengan tombol Escape.
  useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Tutup drawer jika layar melebar ke ukuran desktop.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    function onChange() {
      if (query.matches) setMobileOpen(false);
    }

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function toggleSidebar() {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    if (isDesktop) {
      // Desktop: ciutkan / lebarkan sidebar. Status disimpan di <html>
      // (data-sidebar) supaya sudah benar sejak render pertama (tanpa kedip).
      const root = document.documentElement;
      const next =
        root.dataset.sidebar === "collapsed" ? "expanded" : "collapsed";

      root.dataset.sidebar = next;

      try {
        window.localStorage.setItem("rbxdaily-sidebar", next);
      } catch {
        // abaikan jika localStorage tidak tersedia
      }
    } else {
      // Mobile: buka / tutup drawer.
      setMobileOpen((open) => !open);
    }
  }

  const roleLabel = viewer?.role === "ADMIN" ? "admin" : "user";

  return (
    <div className="app-shell" data-mobile-open={mobileOpen ? "true" : "false"}>
      <aside id="app-sidebar" className="app-sidebar" aria-label="Sidebar">
        <div className="sb-header">
          <Link
            href="/"
            className="sb-brand"
            aria-label="RbxDaily - Beranda"
            title="RbxDaily"
          >
            <span className="sb-brand-mark" aria-hidden="true">
              <Gift size={18} />
            </span>
            <span className="sb-label sb-brand-text">
              Rbx<span>Daily</span>
            </span>
          </Link>
        </div>

        <nav className="sb-nav" aria-label="Navigasi utama">
          <div className="sb-group-label">
            <span className="sb-label">Menu</span>
          </div>

          {mainNav.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}

          {viewer?.role === "ADMIN" && (
            <>
              <div className="sb-group-label">
                <span className="sb-label">Admin</span>
              </div>

              {adminNav.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                />
              ))}
            </>
          )}
        </nav>

        <div className="sb-footer">
          {viewer ? (
            <>
              <div className="sb-user" title={viewer.displayName}>
                <User className="sb-icon" aria-hidden="true" />
                <div className="sb-label sb-user-text">
                  <strong>{viewer.displayName}</strong>
                  <span>{roleLabel}</span>
                </div>
              </div>

              <form action={logoutAction}>
                <button type="submit" className="sb-item" title="Logout">
                  <LogOut className="sb-icon" aria-hidden="true" />
                  <span className="sb-label">Logout</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="sb-item"
                aria-current={pathname === "/login" ? "page" : undefined}
                title="Login"
              >
                <LogIn className="sb-icon" aria-hidden="true" />
                <span className="sb-label">Login</span>
              </Link>

              <Link
                href="/register"
                className="sb-item"
                aria-current={pathname === "/register" ? "page" : undefined}
                title="Daftar"
              >
                <UserPlus className="sb-icon" aria-hidden="true" />
                <span className="sb-label">Daftar</span>
              </Link>
            </>
          )}
        </div>
      </aside>

      <div
        className="app-overlay"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <div className="app-main">
        <header className="site-navbar">
          <div className="navbar-inner">
            <button
              type="button"
              className="nav-icon-btn"
              onClick={toggleSidebar}
              aria-label="Ubah sidebar"
              aria-controls="app-sidebar"
              title="Ubah sidebar"
            >
              <PanelLeft size={18} aria-hidden="true" />
            </button>

            <Link
              href="/"
              className="navbar-logo"
              aria-label="RbxDaily - Beranda"
            >
              Rbx<span>Daily</span>
            </Link>

            <div className="navbar-actions">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
