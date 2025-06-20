"use client";

import { useTranslation } from "react-i18next";

export function Features() {
  const { t } = useTranslation();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background/80 backdrop-blur-sm">
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
  );
}
