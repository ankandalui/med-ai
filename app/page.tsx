"use client";

import { useTranslation } from "react-i18next";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="bg-background">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            {/* Main Heading with PointerHighlight */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  The future of healthcare is
                </div>
                <div className="flex justify-center mt-2">
                  <PointerHighlight containerClassName="mt-6">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI-powered
                    </span>
                  </PointerHighlight>
                </div>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
                {t("homepage.subtitle")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 items-center flex-col sm:flex-row pt-4">
              <a
                className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm sm:text-base h-12 sm:h-14 px-8 shadow-lg"
                href="/diagnosis"
              >
                {t("homepage.getStarted")}
              </a>
              <a
                className="w-full sm:w-auto rounded-full border border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 flex items-center justify-center font-medium text-sm sm:text-base h-12 sm:h-14 px-8"
                href="/about"
              >
                {t("homepage.learnMore")}
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Our Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover how our AI-powered platform is transforming healthcare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="p-6 sm:p-8 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">🔬</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">
                  {t("features.aiDiagnosis")}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t("features.aiDiagnosisDesc")}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">📊</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">
                  {t("features.healthMonitoring")}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t("features.healthMonitoringDesc")}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg sm:text-xl">💬</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold">
                  {t("features.telemedicine")}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {t("features.telemedicineDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
