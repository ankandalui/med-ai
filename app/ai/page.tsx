"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Stethoscope,
  Upload,
  Camera,
  FileText,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AIPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<
    "symptoms" | "disease" | null
  >(null);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      desc: "Advanced machine learning algorithms",
    },
    {
      icon: Stethoscope,
      title: "Medical Accuracy",
      desc: "Trained on medical datasets",
    },
    {
      icon: Activity,
      title: "Real-time Results",
      desc: "Get instant predictions",
    },
    {
      icon: CheckCircle,
      title: "Reliable Insights",
      desc: "Evidence-based recommendations",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Medical AI Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get accurate medical predictions using advanced AI technology.
            Analyze symptoms or diagnose skin conditions with our intelligent
            healthcare tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            >
              <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Main AI Tools Section */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Symptom Prediction Card */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Symptom Prediction
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    AI-powered symptom analysis
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Describe your symptoms in natural language
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Get personalized health insights
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Receive recommendations for next steps
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    How it works:
                  </span>
                </div>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </span>
                    <span>Enter your symptoms and health concerns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </span>
                    <span>AI analyzes patterns and medical data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </span>
                    <span>Get personalized health predictions</span>
                  </li>
                </ol>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                onClick={() => setActiveSection("symptoms")}
              >
                Start Symptom Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Disease Prediction Card */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Skin Disease Detection
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    AI-powered image analysis
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Upload photos of skin conditions
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Get instant AI diagnosis
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Receive treatment recommendations
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Supported formats:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>JPG, JPEG</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>PNG</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Max 10MB</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>High quality</span>
                  </div>
                </div>
              </div>{" "}
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                onClick={() => (window.location.href = "/disease-prediction")}
              >
                Upload Image for Analysis
                <Upload className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                  Important Medical Disclaimer
                </h3>
                <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                  This AI tool is designed to assist and provide insights, but
                  should not replace professional medical advice, diagnosis, or
                  treatment. Always consult with qualified healthcare
                  professionals for accurate medical evaluation and personalized
                  treatment plans. In case of medical emergencies, contact
                  emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
