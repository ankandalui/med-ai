"use client";

import { useTranslation } from "react-i18next";

export default function MonitoringPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          {t("features.healthMonitoring")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          {t("features.healthMonitoringDesc")}
        </p>
        <div className="pt-8">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-full">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              🚧 Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
