"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageDropdown } from "@/components/language-dropdown";
import { useTranslation } from "react-i18next";
import { Menu, X, Download, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isInstallable, isInstalled, installPWA } = usePWAInstall(); // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-dropdown")) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };
  const handleInstallPWA = async () => {
    await installPWA();
  };
  // Dynamic navigation based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { name: t("navbar.features"), href: "/features" },
        { name: t("navbar.about"), href: "/about" },
        { name: t("navbar.contact"), href: "/contact" },
      ];
    }
    if (user?.userType === "HEALTH_WORKER") {
      return [
        { name: t("navigation.dashboard"), href: "/health-worker/dashboard" },
        { name: t("navigation.aiAnalysis"), href: "/ai" },
        {
          name: t("navigation.diseasePrediction"),
          href: "/disease-prediction",
        },
        { name: t("navigation.symptomAnalysis"), href: "/symptom-prediction" },
        { name: t("navigation.diagnosis"), href: "/diagnosis" },
        { name: t("navigation.patients"), href: "/health-worker/patients" },
        { name: t("navigation.reports"), href: "/health-worker/reports" },
      ];
    }
    if (user?.userType === "PATIENT") {
      return [
        { name: t("navigation.dashboard"), href: "/patient/dashboard" },
        { name: t("navigation.medicalRecords"), href: "/patient/locker" },
        { name: t("navigation.reminders"), href: "/patient/reminders" },
        { name: t("navigation.emergency"), href: "/patient/emergency" },
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();
  return (
    <div className="w-full border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5"></div>
      <div className="container mx-auto px-4 relative">
        {" "}
        <div className="flex h-14 md:h-16 items-center">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                <img
                  src="/icons/logo.svg"
                  alt="Chikit-সা Logo"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>{" "}
          {/* Desktop Navigation - Center */}
          <div className="flex-grow flex justify-center">
            <nav className="hidden md:flex items-center space-x-10">
              {" "}
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.name}
                </Link>
              ))}
            </nav>{" "}
          </div>
          {/* Right Side - Theme, Language, Auth */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              {/* Desktop Auth Section (Hidden on mobile) */}
              <div className="hidden md:flex items-center space-x-3">
                {" "}
                {isAuthenticated ? (
                  /* User Avatar Dropdown */
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        {user?.name ? (
                          user.name.charAt(0).toUpperCase()
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-sm font-medium hidden lg:block">
                        {user?.name || "User"}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-50">
                        {" "}
                        <div className="py-1">
                          <Link
                            href={
                              user?.userType === "HEALTH_WORKER"
                                ? "/health-worker/profile"
                                : "/patient/profile"
                            }
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            {" "}
                            <User className="w-4 h-4 mr-2" />
                            {t("common.profile")}
                          </Link>
                          {user?.userType === "HEALTH_WORKER" && (
                            <Link
                              href="/health-worker/settings"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              {t("common.settings")}
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t("common.logout")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Login/Signup Buttons */
                  <>
                    {" "}
                    <Link href="/login">
                      <button className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-2">
                        {t("navbar.login")}
                      </button>
                    </Link>
                    <Link href="/signup">
                      <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        {t("navbar.signUp")}
                      </button>
                    </Link>
                  </>
                )}
                {/* App Download Button - Only show if installable and not installed */}
                {isInstallable && !isInstalled && (
                  <Button
                    onClick={handleInstallPWA}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 ml-2"
                  >
                    <Download className="w-4 h-4" />
                    {t("common.downloadApp")}
                  </Button>
                )}
              </div>
              {/* Theme and Language (Always visible) */}
              <ThemeToggle />
              <LanguageDropdown />
              {/* Mobile Menu Button */}{" "}
              <button
                className="md:hidden p-2 rounded-md hover:bg-accent transition-all duration-300 text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <span
                    className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen
                        ? "rotate-45 opacity-0"
                        : "rotate-0 opacity-100"
                    }`}
                  >
                    <Menu className="h-5 w-5" />
                  </span>
                  <span
                    className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen
                        ? "rotate-0 opacity-100"
                        : "-rotate-45 opacity-0"
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </span>
                </div>{" "}
              </button>
            </div>
          </div>
        </div>{" "}
        {/* Mobile Menu with Animation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4"
          }`}
        >
          <div className="border-t py-4 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-all duration-300 transform ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isMobileMenuOpen
                      ? `${index * 100 + 100}ms`
                      : "0ms",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>{" "}
            {/* Mobile Auth Section */}
            <div className="space-y-3 px-4 pt-4 border-t">
              {isAuthenticated ? (
                /* Mobile User Menu */ <div className="space-y-2">
                  {" "}
                  <div className="flex items-center space-x-3 p-3 bg-accent rounded-md border-l-4 border-green-500">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {user?.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium block">
                        {user?.name || "User"}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        {user?.userType === "HEALTH_WORKER"
                          ? t("common.healthWorker")
                          : t("common.patient")}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={
                      user?.userType === "HEALTH_WORKER"
                        ? "/health-worker/profile"
                        : "/patient/profile"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {" "}
                    <button className="w-full flex items-center text-left p-3 text-sm font-medium hover:bg-accent rounded-md transition-colors">
                      <User className="w-4 h-4 mr-2" />
                      {t("common.profile")}
                    </button>
                  </Link>{" "}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center text-left p-3 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("common.logout")}
                  </button>
                </div>
              ) : (
                /* Mobile Login/Signup Buttons */
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button
                      className={`w-full text-left p-3 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-all duration-300 transform ${
                        isMobileMenuOpen
                          ? "translate-x-0 opacity-100 scale-100"
                          : "translate-x-8 opacity-0 scale-95"
                      }`}
                      style={{
                        transitionDelay: isMobileMenuOpen ? "400ms" : "0ms",
                      }}
                    >
                      {t("navbar.login")}
                    </button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button
                      className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded-md font-medium transition-all duration-300 transform shadow-lg ${
                        isMobileMenuOpen
                          ? "translate-x-0 opacity-100 scale-100"
                          : "translate-x-8 opacity-0 scale-95"
                      }`}
                      style={{
                        transitionDelay: isMobileMenuOpen ? "500ms" : "0ms",
                      }}
                    >
                      {t("navbar.signUp")}
                    </button>
                  </Link>
                </>
              )}
              {/* App Download Button - Mobile */}
              {isInstallable && !isInstalled && (
                <Button
                  onClick={() => {
                    handleInstallPWA();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 p-3 font-medium transition-all duration-300 transform shadow-lg ${
                    isMobileMenuOpen
                      ? "translate-x-0 opacity-100 scale-100"
                      : "translate-x-8 opacity-0 scale-95"
                  }`}
                  style={{
                    transitionDelay: isMobileMenuOpen ? "600ms" : "0ms",
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("common.installApp")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
