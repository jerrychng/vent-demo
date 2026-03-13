"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type EngineerBottomBarProps = {
  active: "home" | "schedule";
};

function NavIcon({ iconPath }: { iconPath: string }) {
  return (
    <span
      aria-hidden="true"
      className="h-5 w-5 bg-primary"
      style={{
        maskImage: `url('${iconPath}')`,
        WebkitMaskImage: `url('${iconPath}')`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

export default function EngineerBottomBar({ active }: EngineerBottomBarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const navItems = [
    { key: "home", label: "Home", icon: "/assets/navigation/home-icon.svg", route: "/engineer-schedule" },
    { key: "schedule", label: "Schedule", icon: "/assets/calendar.svg", route: "/engineer-schedule" },
  ] as const;
  const visibleNavItems = user?.is_active === false
    ? navItems.filter((item) => item.key !== "schedule")
    : navItems;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-subtle bg-white px-3 pt-3 shadow-[0_-6px_18px_rgba(23,50,94,0.08)]"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div
        className={`grid overflow-hidden ${
          visibleNavItems.length === 2 ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {visibleNavItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(item.route)}
              className={`flex flex-col items-center gap-1 rounded-[8px] py-3 ${
                isActive ? "bg-accent/45 text-dark-primary" : "text-text-dark-gray"
              }`}
            >
              <NavIcon iconPath={item.icon} />
              <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

