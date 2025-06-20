"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const ios = (window.navigator as any).standalone === true;
      const wasInstalled = localStorage.getItem("pwa-app-installed") === "true";

      if (standalone || ios || wasInstalled) {
        setIsInstalled(true);
        localStorage.setItem("pwa-app-installed", "true");
        return true;
      }
      return false;
    };

    // Check for uninstallation by monitoring display mode changes
    const checkIfUninstalled = () => {
      const wasInstalled = localStorage.getItem("pwa-app-installed") === "true";
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const ios = (window.navigator as any).standalone === true;

      // If was installed but no longer in standalone mode, it was uninstalled
      if (wasInstalled && !standalone && !ios) {
        setIsInstalled(false);
        setIsInstallable(true);
        localStorage.removeItem("pwa-app-installed");
        // Clear other PWA-related storage
        localStorage.removeItem("pwa-toast-last-shown");
        localStorage.removeItem("pwa-toast-dismissed");
      }
    };

    // Initial check
    if (checkIfInstalled()) {
      return;
    }

    // Periodic check for uninstallation (every 5 seconds when app is active)
    const uninstallCheckInterval = setInterval(checkIfUninstalled, 5000);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      // Persist installation state
      localStorage.setItem("pwa-app-installed", "true");
    };
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      clearInterval(uninstallCheckInterval);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === "accepted";
  };

  return {
    isInstallable,
    isInstalled,
    installPWA,
  };
}
