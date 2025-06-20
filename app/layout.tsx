import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/utils/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { Navbar } from "@/components/navbar";
import { LanguageSelector } from "@/components/language-selector";
import { BottomNav } from "@/components/bottom-nav";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <I18nProvider>
            <LanguageSelector />
            <Navbar />
            <main className="pb-16 lg:pb-0">{children}</main>
            <BottomNav />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
