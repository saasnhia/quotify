"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DevizlyLogo } from "@/components/devizly-logo";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  CreditCard,
  Brain,
  Kanban,
  Receipt,
  LogOut,
  Menu,
  X,
  LayoutTemplate,
  FileInput,
  Inbox,
  FileSignature,
  UsersRound,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { NotificationBell } from "@/components/layout/notification-bell";
import { GlobalSearch } from "@/components/layout/global-search";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/briefing", label: "Briefing IA", icon: Brain },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/dashboard/factures", label: "Factures", icon: Receipt },
  { href: "/contrats", label: "Contrats", icon: FileSignature },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/lead-forms", label: "Formulaires", icon: FileInput },
  { href: "/leads", label: "Leads", icon: Inbox },
  { href: "/equipe", label: "Équipe", icon: UsersRound },
  { href: "/pricing", label: "Tarifs", icon: CreditCard },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (user.user_metadata?.full_name || user.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/dashboard" className="transition-transform hover:scale-105">
            <DevizlyLogo width={160} height={40} />
          </Link>
          <NotificationBell />
        </div>

        <div className="px-4 pb-2 pt-3">
          <GlobalSearch />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user.user_metadata?.full_name || "Utilisateur"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <DevizlyLogo width={120} height={32} />
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
