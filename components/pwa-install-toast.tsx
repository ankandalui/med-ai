"use client";

import { useEffect, useState } from "react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";
import { Download, X, Smartphone, Zap, Wifi, Shield } from "lucide-react";

const TOAST_INTERVAL_HOURS = 24; // Show every 24 hours
const TOAST_STORAGE_KEYS = {
  LAST_SHOWN: "pwa-toast-last-shown",
  PERMANENTLY_DISMISSED: "pwa-toast-dismissed",
  APP_INSTALLED: "pwa-app-installed",
};

export function PWAInstallToast() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    // If app is installed, mark it in localStorage and never show again
    if (isInstalled) {
      localStorage.setItem(TOAST_STORAGE_KEYS.APP_INSTALLED, "true");
      return;
    }

    // Don't show if app was already installed before
    const wasInstalled = localStorage.getItem(TOAST_STORAGE_KEYS.APP_INSTALLED);
    if (wasInstalled === "true") {
      return;
    }

    // Don't show if user permanently dismissed
    const isDismissed = localStorage.getItem(
      TOAST_STORAGE_KEYS.PERMANENTLY_DISMISSED
    );
    if (isDismissed === "true") {
      return;
    }

    // Don't show if not installable or already shown in this session
    if (!isInstallable || toastShown) {
      return;
    }

    // Check if enough time has passed since last shown
    const lastShown = localStorage.getItem(TOAST_STORAGE_KEYS.LAST_SHOWN);
    const now = Date.now();
    const intervalMs = TOAST_INTERVAL_HOURS * 60 * 60 * 1000;

    const shouldShow = !lastShown || now - parseInt(lastShown) >= intervalMs;

    if (shouldShow) {
      const timer = setTimeout(() => {
        showInstallToast();
        setToastShown(true);
        localStorage.setItem(TOAST_STORAGE_KEYS.LAST_SHOWN, now.toString());
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, toastShown]);

  const showInstallToast = () => {
    toast.custom(
      (t) => (
        <div className="bg-background border rounded-lg shadow-lg p-4 max-w-md w-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Install MedAI App</h3>
                <p className="text-xs text-muted-foreground">
                  Get the best experience
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span>Faster access & better performance</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Works offline for emergency access</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>Secure & private health data</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={async () => {
                const installed = await installPWA();
                if (installed) {
                  localStorage.setItem(
                    TOAST_STORAGE_KEYS.APP_INSTALLED,
                    "true"
                  );
                }
                toast.dismiss(t);
              }}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Install App</span>
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => {
                localStorage.setItem(
                  TOAST_STORAGE_KEYS.PERMANENTLY_DISMISSED,
                  "true"
                );
                toast.dismiss(t);
              }}
              className="px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Never
            </button>
          </div>
        </div>
      ),
      {
        duration: 15000, // Show for 15 seconds
        position: "bottom-center",
      }
    );
  };

  return null; // This component doesn't render anything directly
}
