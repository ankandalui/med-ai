import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/utils/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { Navbar } from "@/components/navbar";
import { LanguageSelector } from "@/components/language-selector";
import { BottomNav } from "@/components/bottom-nav";
import { PWAInstallToast } from "@/components/pwa-install-toast";
import { PWARegister } from "@/components/pwa-register";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedAI - AI-Powered Healthcare",
  description:
    "Revolutionizing healthcare with AI-powered diagnosis, monitoring, and personalized medical care.",
  keywords: [
    "healthcare",
    "AI",
    "medical",
    "diagnosis",
    "telemedicine",
    "health monitoring",
  ],
  authors: [{ name: "MedAI Team" }],
  creator: "MedAI",
  publisher: "MedAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://med-ai-first.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MedAI - AI-Powered Healthcare",
    description:
      "Revolutionizing healthcare with AI-powered diagnosis, monitoring, and personalized medical care.",
    url: "https://med-ai-first.vercel.app",
    siteName: "MedAI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedAI - AI-Powered Healthcare",
    description:
      "Revolutionizing healthcare with AI-powered diagnosis, monitoring, and personalized medical care.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedAI",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "MedAI",
    "application-name": "MedAI",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <I18nProvider>
            <PWARegister />
            <LanguageSelector />
            <Navbar />
            <main className="pb-16 lg:pb-0">{children}</main>
            <BottomNav />
            <PWAInstallToast />
            <Toaster richColors position="bottom-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
