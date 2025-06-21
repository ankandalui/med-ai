"use client";

import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { HealthWorkerNav } from "@/components/health-worker-nav";

export function NavigationWrapper() {
  const { user, isAuthenticated } = useAuth();

  // Show health worker navigation for health workers
  if (isAuthenticated && user?.userType === "HEALTH_WORKER") {
    return <HealthWorkerNav />;
  }

  // Show default bottom navigation for patients and unauthenticated users
  return <BottomNav />;
}
