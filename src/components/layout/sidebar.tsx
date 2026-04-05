"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { canDo } from "@/lib/permissions";
import { signOutAction } from "@/app/actions/auth";

type Permission = { resource: string; action: string };

interface SidebarProps {
  userName: string | null | undefined;
  roleName: string | null | undefined;
  permissions: Permission[];
}

interface NavItem {
  href: string;
  label: string;
  icon: () => React.ReactElement;
  resource: string;
  altResource?: string;
  indent?: true;
}

const NAV: NavItem[] = [
  { href: "/dashboard",                 label: "Dashboard",        icon: IconDashboard,   resource: "dashboard" },
  { href: "/secretariat",               label: "Secrétariat",      icon: IconSecretariat, resource: "secretariat" },
  { href: "/secretariat/announcements", label: "Annonces",         icon: IconAnnounce,    resource: "secretariat", indent: true },
  { href: "/secretariat/reports",       label: "Comptes-rendus",   icon: IconReport,      resource: "secretariat", indent: true },
  { href: "/secretariat/notes",         label: "Notes",            icon: IconNotes,       resource: "secretariat", indent: true },
  { href: "/secretariat/tasks",         label: "Tâches",           icon: IconTasks,       resource: "secretariat", indent: true },
  { href: "/inventory",                 label: "Inventaire",       icon: IconInventory,   resource: "inventory" },
  { href: "/treasury",                  label: "Trésorerie",       icon: IconTreasury,    resource: "treasury" },
  { href: "/members",                   label: "Membres & Rôles",  icon: IconTeam,        resource: "members",    altResource: "roles" },
];

/* ─── Icônes SVG inline ──────────────────────────────────────────────── */

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconSecretariat() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <line x1="5" y1="6" x2="11" y2="6" />
      <line x1="5" y1="9" x2="9" y2="9" />
    </svg>
  );
}

function IconAnnounce() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 5h8l3-2v10l-3-2H2V5z" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="1" width="10" height="14" rx="1" />
      <line x1="6" y1="5" x2="10" y2="5" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <line x1="6" y1="11" x2="8" y2="11" />
    </svg>
  );
}

function IconNotes() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 2h8l3 3v9H3V2z" />
      <path d="M11 2v3h3" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <line x1="6" y1="11" x2="10" y2="11" />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 8l3 3 7-7" />
      <rect x="1" y="1" width="14" height="14" rx="2" />
    </svg>
  );
}

function IconInventory() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M1 5l7-4 7 4v8l-7 3-7-3V5z" />
      <path d="M1 5l7 4 7-4" />
      <line x1="8" y1="9" x2="8" y2="16" />
    </svg>
  );
}

function IconTreasury() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v1.5M8 10.5V12" />
      <path d="M6 6.5c0-1 .9-1.5 2-1.5s2 .5 2 1.5-1 1.5-2 1.5-2 .5-2 1.5.9 1.5 2 1.5 2-.5 2-1.5" />
    </svg>
  );
}


function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="5.5" cy="5" r="2.5" />
      <path d="M1 14c0-2.5 2-4.5 4.5-4.5S10 11.5 10 14" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 10.5c1.8.2 3 1.5 3 3" />
      <line x1="12" y1="2" x2="14" y2="4" strokeWidth="1" />
      <circle cx="13" cy="13" r="2" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  );
}

function IconHamburger() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="5" x2="17" y2="5" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="15" x2="17" y2="15" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="4" x2="14" y2="14" />
      <line x1="14" y1="4" x2="4" y2="14" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3" />
      <path d="M10 10l3-3-3-3" />
      <line x1="13" y1="7" x2="5" y2="7" />
    </svg>
  );
}

/* ─── Composant NavContent ───────────────────────────────────────────── */

interface NavContentProps {
  permissions: Permission[];
  pathname: string;
  onLinkClick?: () => void;
  userName: string | null | undefined;
  roleName: string | null | undefined;
}

function NavContent({ permissions, pathname, onLinkClick, userName, roleName }: NavContentProps) {
  const visibleNav = NAV.filter((item) =>
    canDo(permissions, item.resource, "read") ||
    (item.altResource !== undefined && canDo(permissions, item.altResource, "read"))
  );

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Navigation principale">
        <ul className="space-y-0.5" role="list">
          {visibleNav.map((item) => {
            const isActive = item.indent
              ? pathname === item.href
              : pathname === item.href ||
                (pathname.startsWith(item.href + "/") &&
                  !pathname.startsWith(item.href + "/logs"));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  {...(onLinkClick !== undefined && { onClick: onLinkClick })}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors",
                    item.indent ? "px-7" : "px-3",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:bg-surface-2 hover:text-text"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Utilisateur + déconnexion */}
      <div className="border-t border-border p-3">
        <div className="mb-2 px-1">
          <p className="text-sm font-medium text-text truncate">{userName ?? "—"}</p>
          {roleName && <p className="text-xs text-muted truncate">{roleName}</p>}
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-muted hover:bg-surface-2 hover:text-text transition-colors"
          >
            <IconSignOut />
            Déconnexion
          </button>
        </form>
      </div>
    </>
  );
}

/* ─── Sidebar principale ─────────────────────────────────────────────── */

export function Sidebar({ userName, roleName, permissions }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const DRAWER_ID = "mobile-sidebar-drawer";

  const closeDrawer = useCallback(() => {
    setMobileOpen(false);
  }, []);

  /* Fermer avec Escape */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer();
        openButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeDrawer]);

  /* Focus trap dans le drawer */
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    // Focus le premier élément à l'ouverture
    first?.focus();
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [mobileOpen]);

  /* Bloquer le scroll body quand le drawer est ouvert */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Skip link — accessibilité RGAA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Aller au contenu principal
      </a>

      {/* ── Barre mobile fixe ───────────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center gap-3 border-b border-border bg-surface px-4"
        role="banner"
      >
        <button
          ref={openButtonRef}
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu de navigation"
          aria-expanded={mobileOpen}
          aria-controls={DRAWER_ID}
          className="rounded p-1.5 -ml-1.5 text-muted hover:bg-surface-2 hover:text-text transition-colors"
        >
          <IconHamburger />
        </button>
        <span className="text-base font-bold tracking-widest text-primary" aria-hidden="true">
          CLIFFSIDE
        </span>
      </div>

      {/* ── Backdrop mobile ─────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ── Drawer mobile ───────────────────────────────────────────── */}
      <aside
        id={DRAWER_ID}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-base font-bold tracking-widest text-primary flex-1">CLIFFSIDE</span>
          <button
            onClick={closeDrawer}
            className="rounded p-1.5 text-muted hover:bg-surface-2 hover:text-text transition-colors"
            aria-label="Fermer le menu"
          >
            <IconClose />
          </button>
        </div>
        <NavContent
          permissions={permissions}
          pathname={pathname}
          onLinkClick={closeDrawer}
          userName={userName}
          roleName={roleName}
        />
      </aside>

      {/* ── Sidebar desktop (statique) ───────────────────────────────── */}
      <aside
        className="hidden md:flex h-full w-56 flex-col border-r border-border bg-surface"
        aria-label="Navigation principale"
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-base font-bold tracking-widest text-primary">CLIFFSIDE</span>
        </div>
        <NavContent
          permissions={permissions}
          pathname={pathname}
          userName={userName}
          roleName={roleName}
        />
      </aside>
    </>
  );
}
