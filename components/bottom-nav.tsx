"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Home, Activity, FileText, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      isActive: pathname === "/",
      requireAuth: false,
    },
    {
      href: "/patient/dashboard",
      icon: Activity,
      label: "Dashboard",
      isActive:
        pathname === "/patient/dashboard" ||
        pathname.startsWith("/patient/dashboard"),
      requireAuth: true,
    },
    {
      href: "/patient/locker",
      icon: FileText,
      label: "Locker",
      isActive:
        pathname === "/patient/locker" ||
        pathname.startsWith("/patient/locker"),
      requireAuth: true,
    },
    {
      href: "/patient/reminders",
      icon: Bell,
      label: "Reminders",
      isActive:
        pathname === "/patient/reminders" ||
        pathname.startsWith("/patient/reminders"),
      requireAuth: true,
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      isActive: pathname === "/profile" || pathname.startsWith("/profile/"),
      requireAuth: true,
    },
  ];

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (item.requireAuth && !isAuthenticated && !isLoading) {
      router.push("/login");
      return;
    }
    router.push(item.href);
  };
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t supports-[backdrop-filter]:bg-background/80">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isDisabled = item.requireAuth && !isAuthenticated && !isLoading;

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                item.isActive
                  ? "text-primary"
                  : isDisabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
              )}
              disabled={isDisabled}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  item.isActive && "text-primary",
                  isDisabled && "opacity-50"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  item.isActive && "text-primary",
                  isDisabled && "opacity-50"
                )}
              >
                {item.label}
              </span>
              {isDisabled && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
