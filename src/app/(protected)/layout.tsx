"use client";

/**
 * Protected layout: all routes under (protected)/ require auth.
 * - Auth state comes from AuthContext (user set from JWT on load or after login).
 * - If not loading and no user → redirect to /login.
 * - Sidebar: on small screens it is in a toggleable drawer; on md+ always visible.
 */
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LayoutDashboard, BriefcaseBusiness, Building2, FileText, Users, LogOut, Menu, UserCog } from "lucide-react";
import type { User } from "@/types/models";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const sidebarNavClass =
  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

const sidebarNavActiveClass =
  "w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

function SidebarContent({
  user,
  pathname,
  onNavClick,
  onLogout,
}: {
  user: User;
  pathname: string;
  onNavClick?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-center rounded-md border border-sidebar-border/60 bg-white px-3 py-2">
          <Image
            src="/assets/aspect-logo-primary.svg"
            alt="Aspect Maintenance Services"
            width={180}
            height={35}
            className="h-8 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-lg font-semibold">Job Management System</h1>
        <p className="text-xs mt-1">{user.full_name}</p>
        <p className="text-[11px] uppercase text-muted-foreground/80">{user.role}</p>
      </div>
      <nav className="flex-1 space-y-1 text-sm">
        <Link href="/dashboard" onClick={onNavClick}>
          <Button variant="ghost" className={pathname === "/dashboard" ? sidebarNavActiveClass : sidebarNavClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/jobs" onClick={onNavClick}>
          <Button variant="ghost" className={pathname.startsWith("/jobs") ? sidebarNavActiveClass : sidebarNavClass}>
            <BriefcaseBusiness className="h-4 w-4" />
            Jobs
          </Button>
        </Link>
          <Link href="/templates" onClick={onNavClick}>
            <Button variant="ghost" className={pathname.startsWith("/templates") ? sidebarNavActiveClass : sidebarNavClass}>
              <FileText className="h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/sites" onClick={onNavClick}>
            <Button variant="ghost" className={pathname.startsWith("/sites") ? sidebarNavActiveClass : sidebarNavClass}>
              <Building2 className="h-4 w-4" />
              Sites
            </Button>
          </Link>
          {(user.role === "super_admin" || user.role === "trade_manager") && (
            <Link href="/users" onClick={onNavClick}>
              <Button variant="ghost" className={pathname.startsWith("/users") ? sidebarNavActiveClass : sidebarNavClass}>
                <Users className="h-4 w-4" />
                Engineers
              </Button>
            </Link>
          )}
          {user.role === "super_admin" && (
            <Link href="/trade-managers" onClick={onNavClick}>
              <Button variant="ghost" className={pathname.startsWith("/trade-managers") ? sidebarNavActiveClass : sidebarNavClass}>
                <UserCog className="h-4 w-4" />
                Trade Managers
              </Button>
            </Link>
          )}
      </nav>
      <Button
        variant="ghost"
        size="sm"
        className="mt-4 justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={onLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  function handleLogout() {
    setSheetOpen(false);
    logout();
    router.push("/login");
  }

  if (loading || (!user && typeof window !== "undefined")) {
    return <LoadingSpinner variant="fixed" />;
  }

  if (!user) {
    return null;
  }

  const closeSheet = () => setSheetOpen(false);

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Desktop sidebar: visible from md up */}
      <aside className="hidden md:flex w-60 bg-sidebar text-sidebar-foreground p-4 flex-col border-r border-sidebar-border shrink-0">
        <SidebarContent user={user} pathname={pathname ?? ""} onLogout={() => { logout(); router.push("/login"); }} />
      </aside>

      {/* Mobile: menu button + sheet drawer */}
      <div className="md:hidden flex flex-col flex-1 min-w-0">
        <header className="shrink-0 flex items-center gap-2 h-14 px-4 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="p-4 flex flex-col flex-1 overflow-auto">
                <SidebarContent user={user} pathname={pathname ?? ""} onNavClick={closeSheet} onLogout={handleLogout} />
              </div>
            </SheetContent>
          </Sheet>
          <Image
            src="/assets/aspect-logo-primary.svg"
            alt="Aspect Maintenance Services"
            width={140}
            height={27}
            className="h-7 w-auto object-contain"
            priority
          />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>

      {/* Desktop main content */}
      <main className="hidden md:block flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
