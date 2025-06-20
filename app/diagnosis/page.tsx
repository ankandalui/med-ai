"use client";

import { useTranslation } from "react-i18next";

export default function DiagnosisPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("features.aiDiagnosis")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          {t("features.aiDiagnosisDesc")}
        </p>
        <div className="pt-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🚧 Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
