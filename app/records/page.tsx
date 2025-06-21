"use client";

import { useTranslation } from "react-i18next";
import { AuthGuard } from "@/components/auth-guard";

export default function RecordsPage() {
  const { t } = useTranslation();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("features.medicalRecords")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t("features.medicalRecordsDesc")}
          </p>
          <div className="pt-8">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                🚧 Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
