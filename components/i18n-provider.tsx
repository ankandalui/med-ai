"use client";

import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import initI18n from "@/lib/i18n";

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const i18n = initI18n();
    setI18nInstance(i18n);
  }, []);

  if (!i18nInstance) {
    return <div>{children}</div>; // Render children without i18n until it's ready
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
