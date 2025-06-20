export type Language = "en" | "hi" | "bn";

export const translations = {
  en: {
    // Navbar
    features: "Features",
    about: "About",
    contact: "Contact",
    login: "Login",
    signUp: "Sign Up",

    // Homepage
    welcome: "Welcome to MedAI",
    subtitle:
      "Revolutionizing healthcare with AI-powered diagnosis, monitoring, and personalized medical care.",
    getStarted: "Get Started",
    learnMore: "Learn More",

    // Features
    aiDiagnosis: "AI Diagnosis",
    aiDiagnosisDesc:
      "Advanced AI algorithms provide accurate medical diagnosis and treatment recommendations.",
    healthMonitoring: "Health Monitoring",
    healthMonitoringDesc:
      "Real-time health monitoring with personalized insights and alerts.",
    telemedicine: "Telemedicine",
    telemedicineDesc:
      "Connect with healthcare professionals through secure video consultations.",
    medicalRecords: "Medical Records",
    medicalRecordsDesc: "Manage and access your medical history securely.",

    // Language Selector
    chooseLanguage: "Choose Your Language",
    selectLanguageDesc: "Select your preferred language to continue",
    changeLanguageLater: "You can change this later in settings",
  },

  hi: {
    // Navbar
    features: "सुविधाएं",
    about: "हमारे बारे में",
    contact: "संपर्क करें",
    login: "लॉग इन",
    signUp: "साइन अप",

    // Homepage
    welcome: "MedAI में आपका स्वागत है",
    subtitle:
      "AI-संचालित निदान, निगरानी और व्यक्तिगत चिकित्सा देखभाल के साथ स्वास्थ्य सेवा में क्रांति।",
    getStarted: "शुरू करें",
    learnMore: "और जानें",

    // Features
    aiDiagnosis: "AI निदान",
    aiDiagnosisDesc:
      "उन्नत AI एल्गोरिदम सटीक चिकित्सा निदान और उपचार सिफारिशें प्रदान करते हैं।",
    healthMonitoring: "स्वास्थ्य निगरानी",
    healthMonitoringDesc:
      "व्यक्तिगत अंतर्दृष्टि और अलर्ट के साथ वास्तविक समय स्वास्थ्य निगरानी।",
    telemedicine: "टेलीमेडिसिन",
    telemedicineDesc:
      "सुरक्षित वीडियो परामर्श के माध्यम से स्वास्थ्य पेशेवरों से जुड़ें।",
    medicalRecords: "चिकित्सा रिकॉर्ड",
    medicalRecordsDesc:
      "अपने चिकित्सा इतिहास को सुरक्षित रूप से प्रबंधित और एक्सेस करें।",

    // Language Selector
    chooseLanguage: "अपनी भाषा चुनें",
    selectLanguageDesc: "जारी रखने के लिए अपनी पसंदीदा भाषा चुनें",
    changeLanguageLater: "आप बाद में सेटिंग्स में इसे बदल सकते हैं",
  },

  bn: {
    // Navbar
    features: "বৈশিষ্ট্য",
    about: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ",
    login: "লগ ইন",
    signUp: "সাইন আপ",

    // Homepage
    welcome: "MedAI এ আপনাকে স্বাগতম",
    subtitle:
      "AI-চালিত রোগ নির্ণয়, পর্যবেক্ষণ এবং ব্যক্তিগত চিকিৎসা সেবার মাধ্যমে স্বাস্থ্যসেবায় বিপ্লব।",
    getStarted: "শুরু করুন",
    learnMore: "আরও জানুন",

    // Features
    aiDiagnosis: "AI রোগ নির্ণয়",
    aiDiagnosisDesc:
      "উন্নত AI অ্যালগরিদম নির্ভুল চিকিৎসা নির্ণয় এবং চিকিৎসার সুপারিশ প্রদান করে।",
    healthMonitoring: "স্বাস্থ্য পর্যবেক্ষণ",
    healthMonitoringDesc:
      "ব্যক্তিগত অন্তর্দৃষ্টি এবং সতর্কতার সাথে রিয়েল-টাইম স্বাস্থ্য পর্যবেক্ষণ।",
    telemedicine: "টেলিমেডিসিন",
    telemedicineDesc:
      "নিরাপদ ভিডিও পরামর্শের মাধ্যমে স্বাস্থ্য পেশাদারদের সাথে সংযুক্ত হন।",
    medicalRecords: "চিকিৎসা রেকর্ড",
    medicalRecordsDesc:
      "আপনার চিকিৎসার ইতিহাস নিরাপদে পরিচালনা এবং অ্যাক্সেস করুন।",

    // Language Selector
    chooseLanguage: "আপনার ভাষা বেছে নিন",
    selectLanguageDesc: "চালিয়ে যেতে আপনার পছন্দের ভাষা নির্বাচন করুন",
    changeLanguageLater: "আপনি পরে সেটিংসে এটি পরিবর্তন করতে পারেন",
  },
} as const;

export function useTranslation(language: Language) {
  return translations[language];
}
