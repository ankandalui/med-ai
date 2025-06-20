"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageDropdown } from "@/components/language-dropdown";
import { useTranslation } from "react-i18next";
import { Menu, X, Download } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export function Navbar() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  const navigationItems = [
    { name: t("navbar.features"), href: "/features" },
    { name: t("navbar.about"), href: "/about" },
    { name: t("navbar.contact"), href: "/contact" },
  ];

  const handleInstallPWA = async () => {
    await installPWA();
  };
  return (
    <div className="w-full border-b border-white/20 bg-white/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/5 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
      <div className="container mx-auto px-4 relative">
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/icons/medailogo.svg"
                alt="MedAI Logo"
                width={32}
                height={32}
                className=""
              />
            </div>
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MedAI
            </span>
          </Link>
          {/* Desktop Navigation - Center (Hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>{" "}
          {/* Right Side - Theme, Language, Auth */}
          <div className="flex items-center space-x-2">
            {" "}
            {/* Desktop Auth Buttons (Hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-3">
              <Link href="/login">
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                  {t("navbar.login")}
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  {t("navbar.signUp")}
                </button>
              </Link>
              {/* App Download Button - Only show if installable and not installed */}
              {isInstallable && !isInstalled && (
                <Button
                  onClick={handleInstallPWA}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 ml-2"
                >
                  <Download className="w-4 h-4" />
                  Download App
                </Button>
              )}
            </div>
            {/* Theme and Language (Always visible) */}
            <ThemeToggle />
            <LanguageDropdown />
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent transition-all duration-300"
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
              </div>
            </button>
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
                  className={`block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-300 transform ${
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
            {/* Mobile Auth Buttons */}
            <div className="space-y-3 px-4 pt-4 border-t">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button
                  className={`w-full text-left p-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-300 transform ${
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
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
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
                  {" "}
                  {t("navbar.signUp")}
                </button>{" "}
              </Link>
              {/* Mobile App Download Button - Only show if installable and not installed */}
              {isInstallable && !isInstalled && (
                <div className="pt-2">
                  <Button
                    className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 p-3 font-medium transition-all duration-300 transform shadow-lg ${
                      isMobileMenuOpen
                        ? "translate-x-0 opacity-100 scale-100"
                        : "translate-x-8 opacity-0 scale-95"
                    }`}
                    style={{
                      transitionDelay: isMobileMenuOpen ? "600ms" : "0ms",
                    }}
                    onClick={() => {
                      handleInstallPWA();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download App
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
