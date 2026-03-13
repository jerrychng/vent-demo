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
import { Menu } from "lucide-react";
import type { User } from "@/types/models";
import LoadingSpinner from "@/app/components/LoadingSpinner";

const sidebarNavClass =
  "w-full rounded-lg border border-transparent px-2 py-3 text-base font-normal text-dark-primary hover:bg-background hover:font-bold";

const sidebarNavActiveClass =
  "w-full rounded-lg border border-dark-primary bg-accent px-2 py-3 text-base font-bold text-dark-primary";

function SidebarContent({
  user,
  pathname,
  onNavClick,
  onLogout,
  compact = false,
}: {
  user: User;
  pathname: string;
  onNavClick?: () => void;
  onLogout: () => void;
  compact?: boolean;
}) {
  const roleLabel = user.role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isDashboardActive =
    user.role === "engineer"
      ? normalizedPath.startsWith("/engineer-schedule")
      : normalizedPath.startsWith("/dashboard");
  const navAlignClass = compact ? "justify-center lg:justify-start" : "justify-start";
  const itemLabelClass = compact ? "hidden lg:inline" : "inline";

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-center px-4 py-6">
          <Image
            src="/assets/aspect-logo-primary.svg"
            alt="Aspect Maintenance Services"
            width={164}
            height={32}
            className={compact ? "hidden h-8 w-auto object-contain lg:block" : "h-8 w-auto object-contain"}
            priority
          />
          {compact && (
            <Image
              src="/assets/aspect-logo-icon.svg"
              alt="Aspect"
              width={32}
              height={32}
              className="h-8 w-8 object-contain lg:hidden"
              priority
            />
          )}
        </div>
        <div className={compact ? "hidden px-2 pb-2 lg:block" : "px-2 pb-2"}>
          <p className="text-xs text-text-dark-gray">{user.full_name}</p>
          <p className="text-[11px] uppercase text-text-dark-gray">{roleLabel}</p>
        </div>
      </div>
      <nav className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-3">
          <li>
            <Link href={user.role === "engineer" ? "/engineer-schedule" : "/dashboard"} onClick={onNavClick}>
              <Button
                variant="transparent"
                className={`${isDashboardActive ? sidebarNavActiveClass : sidebarNavClass} ${navAlignClass}`}
              >
                <Image
                  src="/assets/navigation/home-icon.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 object-contain"
                  aria-hidden
                />
                <span className={itemLabelClass}>{user.role === "engineer" ? "Home" : "Dashboard"}</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/templates" onClick={onNavClick}>
              <Button
                variant="transparent"
                className={`${pathname.startsWith("/templates") ? sidebarNavActiveClass : sidebarNavClass} ${navAlignClass}`}
              >
                <Image
                  src="/assets/navigation/report-icon.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 object-contain"
                  aria-hidden
                />
                <span className={itemLabelClass}>Templates</span>
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/sites" onClick={onNavClick}>
              <Button
                variant="transparent"
                className={`${pathname.startsWith("/sites") ? sidebarNavActiveClass : sidebarNavClass} ${navAlignClass}`}
              >
                <Image
                  src="/assets/settings/location-icon.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 shrink-0 object-contain"
                  aria-hidden
                />
                <span className={itemLabelClass}>Sites</span>
              </Button>
            </Link>
          </li>
          {(user.role === "super_admin" || user.role === "trade_manager") && (
            <li>
              <Link href="/users" onClick={onNavClick}>
                <Button
                  variant="transparent"
                  className={`${pathname.startsWith("/users") ? sidebarNavActiveClass : sidebarNavClass} ${navAlignClass}`}
                >
                  <Image
                    src="/assets/settings/users-icon.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 object-contain"
                    aria-hidden
                  />
                  <span className={itemLabelClass}>Engineers</span>
                </Button>
              </Link>
            </li>
          )}
          {user.role === "super_admin" && (
            <li>
              <Link href="/trade-managers" onClick={onNavClick}>
                <Button
                  variant="transparent"
                  className={`${pathname.startsWith("/trade-managers") ? sidebarNavActiveClass : sidebarNavClass} ${navAlignClass}`}
                >
                  <Image
                    src="/assets/settings/user-rectangle.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 object-contain"
                    aria-hidden
                  />
                  <span className={itemLabelClass}>Trade Managers</span>
                </Button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div className={compact ? "mt-auto hidden px-2 py-4 lg:block" : "mt-auto px-2 py-4"}>
        <hr className="border-t border-subtle my-2" />
        <h3 className="px-2 py-2 text-lg font-semibold text-dark-primary">Settings</h3>
        <Button
          variant="transparent"
          className="w-full justify-start rounded-lg border border-transparent px-2 py-2 text-base font-normal text-dark-primary hover:bg-background hover:font-bold"
          onClick={onLogout}
        >
          <Image
            src="/assets/settings/lock-icon.svg"
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 shrink-0 object-contain"
            aria-hidden
          />
          Log-out
        </Button>
      </div>
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

  if (user.role === "engineer") {
    const isEngineerSchedule =
      pathname === "/engineer-schedule" || pathname === "/engineer-schedule/";

    return (
      <main
        className="min-h-screen bg-background"
        style={isEngineerSchedule ? undefined : { paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {children}
      </main>
    );
  }

  const closeSheet = () => setSheetOpen(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar: visible from md up */}
      <aside className="hidden md:flex md:w-[120px] lg:w-64 fixed left-0 top-0 h-full z-40 bg-white text-dark-primary flex-col border-r border-subtle shadow-sm">
        <SidebarContent
          compact
          user={user}
          pathname={pathname ?? ""}
          onLogout={() => { logout(); router.push("/login"); }}
        />
      </aside>

      {/* Mobile: menu button + sheet drawer */}
      <div className="md:hidden flex flex-col flex-1 min-w-0">
        <header className="shrink-0 flex items-center gap-2 h-14 px-4 border-b border-subtle bg-white text-dark-primary">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="transparent" size="sm" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-[85vw] p-0 flex flex-col bg-white text-dark-primary">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col flex-1 overflow-auto">
                <SidebarContent user={user} pathname={pathname ?? ""} onNavClick={closeSheet} onLogout={handleLogout} />
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-background">{children}</main>
      </div>

      {/* Desktop main content */}
      <main className="hidden md:block flex-1 md:ml-[120px] lg:ml-64 p-6 overflow-auto bg-background">{children}</main>
    </div>
  );
}

