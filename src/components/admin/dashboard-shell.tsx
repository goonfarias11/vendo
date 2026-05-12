// src/components/admin/dashboard-shell.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Store } from "@prisma/client";
import type { User } from "next-auth";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const NAV = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard", exact: true },
  { href: "/dashboard/products", icon: "📦", label: "Productos" },
  { href: "/dashboard/orders", icon: "💬", label: "Pedidos" },
  { href: "/dashboard/coupons", icon: "🎟️", label: "Cupones" },
  { href: "/dashboard/store", icon: "🎨", label: "Mi tienda" },
  { href: "/dashboard/stats", icon: "📊", label: "Estadísticas" },
  { href: "/dashboard/qr", icon: "📱", label: "Código QR" },
  { href: "/dashboard/billing", icon: "💳", label: "Facturación" },
];

interface Props {
  store: Store & { subscription?: any };
  user: User;
  children: React.ReactNode;
}

export function DashboardShell({ store, user, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-surface font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-ink transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-white/8 h-16 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <Link href="/dashboard" className="font-serif text-xl text-white tracking-tight">
              vend<span className="text-green">ó</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/40 hover:text-white/80 transition-colors text-sm p-1"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 text-sm transition-all border-l-[3px]",
                  collapsed ? "justify-center px-0" : "px-5",
                  active
                    ? "border-green text-green bg-green/10"
                    : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {!collapsed && (
                  <span className={active ? "font-medium" : "font-normal"}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Trial badge */}
        {!collapsed && store.subscription?.status === "TRIALING" && (
          <div className="mx-3 mb-3 px-3 py-2 bg-green/15 rounded-xl border border-green/20">
            <p className="text-[11px] text-green font-semibold">Trial activo</p>
            <p className="text-[10px] text-white/40 mt-0.5">
              Termina el{" "}
              {store.subscription.trialEnds
                ? new Date(store.subscription.trialEnds).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
                : "—"}
            </p>
          </div>
        )}

        {/* User */}
        <div
          className={cn(
            "flex items-center gap-3 border-t border-white/8 p-4",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{store.name}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">
              vendó.app/s/
            </span>
            <a
              href={`/s/${store.slug}`}
              target="_blank"
              rel="noopener"
              className="text-sm font-medium text-green hover:underline"
            >
              {store.slug}
            </a>
            <span className="text-[10px] bg-green-pale text-green-dark px-2 py-0.5 rounded-full font-semibold ml-1">
              ACTIVA
            </span>
          </div>
          <a
            href={`/s/${store.slug}`}
            target="_blank"
            rel="noopener"
            className="text-xs text-ink-muted hover:text-ink border border-border rounded-lg px-3 py-1.5 transition-colors"
          >
            Ver tienda →
          </a>
        </header>

        {/* Page content */}
        <div className="p-8">{children}</div>
      </main>

      <Toaster />
    </div>
  );
}
