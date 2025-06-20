"use client";

import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <main className="flex flex-col gap-8 items-center text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("homepage.welcome")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              {t("homepage.subtitle")}
            </p>
          </div>

          <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
            <a
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base h-12 px-8"
              href="/diagnosis"
            >
              {t("homepage.getStarted")}
            </a>
            <a
              className="rounded-full border border-input hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center font-medium text-sm sm:text-base h-12 px-8"
              href="/about"
            >
              {t("homepage.learnMore")}
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-6xl">
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🔬</span>
                </div>
                <h3 className="text-lg font-semibold">
                  {t("features.aiDiagnosis")}
                </h3>
              </div>
              <p className="text-muted-foreground">
                {t("features.aiDiagnosisDesc")}
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
                <h3 className="text-lg font-semibold">
                  {t("features.healthMonitoring")}
                </h3>
              </div>
              <p className="text-muted-foreground">
                {t("features.healthMonitoringDesc")}
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💬</span>
                </div>
                <h3 className="text-lg font-semibold">
                  {t("features.telemedicine")}
                </h3>
              </div>
              <p className="text-muted-foreground">
                {t("features.telemedicineDesc")}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
