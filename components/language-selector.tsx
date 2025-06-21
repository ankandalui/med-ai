"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
] as const;

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if language preference is already set
    const savedLanguage = localStorage.getItem("medai-language");
    if (!savedLanguage) {
      setShowLanguageSelector(true);
    }
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("medai-language", languageCode);
    setShowLanguageSelector(false);
  };

  if (!mounted || !showLanguageSelector) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Language</h2>
          <p className="text-muted-foreground">
            Select your preferred language to continue
          </p>
        </div>
        <div className="space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              className="w-full p-4 text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              {" "}
              <div className="flex items-center">
                <div>
                  <div className="font-medium">{language.name}</div>
                  <div className="text-lg text-muted-foreground group-hover:text-accent-foreground">
                    {language.nativeName}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>{" "}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          You can change this later in settings
        </div>
      </div>
    </div>
  );
}
