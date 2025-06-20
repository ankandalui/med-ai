import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enCommon from "../public/locales/en/common.json";
import hiCommon from "../public/locales/hi/common.json";
import bnCommon from "../public/locales/bn/common.json";

export const defaultNS = "common";
export const resources = {
  en: {
    common: enCommon,
  },
  hi: {
    common: hiCommon,
  },
  bn: {
    common: bnCommon,
  },
} as const;

const initI18n = () => {
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: "en", // default language
        fallbackLng: "en",
        defaultNS,
        resources,
        debug: process.env.NODE_ENV === "development",

        interpolation: {
          escapeValue: false, // React already escapes values
        },

        detection: {
          order: ["localStorage", "navigator", "htmlTag"],
          caches: ["localStorage"],
          lookupLocalStorage: "medai-language",
        },

        react: {
          useSuspense: false, // Disable suspense for SSR compatibility
        },
      });
  }
  return i18n;
};

export default initI18n;
