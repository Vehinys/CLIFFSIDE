"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { canDo } from "@/lib/permissions";
import { signOutAction } from "@/app/actions/auth";

type Permission = { resource: string; action: string };

interface SidebarProps {
  userName: string | null | undefined;
  roleName: string | null | undefined;
  permissions: Permission[];
}

const NAV = [
  { href: "/dashboard",                          label: "Dashboard",      icon: "⊞",  resource: "dashboard" },
  { href: "/secretariat",                        label: "Secrétariat",    icon: "🗂️", resource: "secretariat" },
  { href: "/secretariat/announcements",          label: "Annonces",       icon: "📢", resource: "secretariat", indent: true },
  { href: "/secretariat/reports",                label: "Comptes-rendus", icon: "📄", resource: "secretariat", indent: true },
  { href: "/secretariat/notes",                  label: "Notes",          icon: "📝", resource: "secretariat", indent: true },
  { href: "/secretariat/tasks",                  label: "Tâches",         icon: "✅", resource: "secretariat", indent: true },
  { href: "/inventory",                          label: "Inventaire",     icon: "📦", resource: "inventory" },
  { href: "/treasury",                           label: "Trésorerie",     icon: "💰", resource: "treasury" },
  { href: "/members",                            label: "Membres",        icon: "👥", resource: "members" },
  { href: "/roles",                              label: "Rôles",          icon: "🔑", resource: "roles" },
];

export function Sidebar({ userName, roleName, permissions }: SidebarProps) {
  const pathname = usePathname();

  const visibleNav = NAV.filter((item) =>
    canDo(permissions, item.resource, "read")
  );

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-lg font-bold tracking-widest text-primary">CLIFFSIDE</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Navigation principale">
        <ul className="space-y-0.5" role="list">
          {visibleNav.map((item) => {
            const isActive = item.indent
              ? pathname === item.href
              : pathname === item.href || (pathname.startsWith(item.href + "/") && !pathname.startsWith(item.href + "/logs"));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md py-2 text-sm transition-colors",
                    item.indent ? "px-6" : "px-3",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:bg-surface-2 hover:text-text"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
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
          {roleName && (
            <p className="text-xs text-muted truncate">{roleName}</p>
          )}
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-sm text-left text-muted hover:bg-surface-2 hover:text-text transition-colors"
          >
            ← Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
