"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Home,
  Stethoscope,
  Activity,
  FileText,
  Video,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      isActive: pathname === "/",
    },
    {
      href: "/diagnosis",
      icon: Stethoscope,
      label: t("features.aiDiagnosis").split(" ")[0], // Get first word
      isActive: pathname === "/diagnosis",
    },
    {
      href: "/monitoring",
      icon: Activity,
      label: "Monitor",
      isActive: pathname === "/monitoring",
    },
    {
      href: "/records",
      icon: FileText,
      label: "Records",
      isActive: pathname === "/records",
    },
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      isActive: pathname === "/profile",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t supports-[backdrop-filter]:bg-background/80">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                item.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5", item.isActive && "text-primary")}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  item.isActive && "text-primary"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
