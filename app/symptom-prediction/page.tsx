"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Mic,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  TrendingUp,
  Shield,
  ArrowLeft,
  Download,
  Stethoscope,
  Volume2,
} from "lucide-react";

interface SymptomResult {
  success: boolean;
  diagnosis: string;
  is_critical: boolean;
  language: string;
  english_version?: string;
  timestamp: string;
  disclaimer: string;
  error?: string;
}

interface DiagnosisSection {
  title: string;
  content: string;
}

export default function SymptomPredictionPage() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<SymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [playingSection, setPlayingSection] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "bn", name: "বাংলা" },
  ];
  const handleSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setError("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang =
      selectedLanguage === "en"
        ? "en-US"
        : selectedLanguage === "hi"
        ? "hi-IN"
        : "bn-IN";

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(transcript);
      setIsRecording(false);

      // Auto-submit after voice input completes
      setTimeout(() => {
        handleAnalyze();
      }, 1000); // Small delay to ensure state is updated
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const playTextAsAudio = async (text: string, sectionIndex: number) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSection(null);
    }

    try {
      setPlayingSection(sectionIndex);

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          lang: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Audio generation failed");
      }

      const data = await response.json();

      if (data.success) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        setCurrentAudio(audio);

        audio.onended = () => {
          setCurrentAudio(null);
          setPlayingSection(null);
        };

        audio.onerror = () => {
          setCurrentAudio(null);
          setPlayingSection(null);
          setError("Audio playback failed");
        };

        await audio.play();
      } else {
        throw new Error(data.error || "Audio generation failed");
      }
    } catch (error) {
      setPlayingSection(null);
      setError(
        "Could not generate audio. Text-to-speech feature may not be available."
      );
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingSection(null);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("/api/symptom-predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data);
      } else {
        setError(data.error || "Failed to analyze symptoms");
      }
    } catch (err) {
      setError(
        "Failed to connect to the analysis service. Please check your internet connection."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSymptoms("");
    setPrediction(null);
    setError(null);
    setSelectedLanguage("en");
  };
  const parseDiagnosis = (text: string): DiagnosisSection[] => {
    const sections: DiagnosisSection[] = [];
    const sectionRegex = /\[(.*?)\]([^[]*)/g;
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim(),
      });
    }

    // Fallback if no sections found
    if (sections.length === 0 && text.trim().length > 0) {
      sections.push({
        title: "Analysis",
        content: text.trim(),
      });
    }

    return sections;
  };

  const diagnosisSections = prediction
    ? parseDiagnosis(prediction.diagnosis)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              AI Symptom Analysis
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Describe your symptoms and get AI-powered medical insights with
            personalized recommendations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!prediction ? (
            /* Input Section */
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                {/* Language Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Language
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                          selectedLanguage === lang.code
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                        }`}
                      >
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>{" "}
                {/* Symptom Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Describe Your Symptoms
                  </label>
                  <div className="relative">
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder={
                        selectedLanguage === "en"
                          ? "Example: I have fever, headache, and cough for 2 days..."
                          : selectedLanguage === "hi"
                          ? "उदाहरण: मुझे 2 दिनों से बुखार, सिरदर्द और खांसी है..."
                          : "উদাহরণ: আমার ২ দিন ধরে জ্বর, মাথাব্যথা এবং কাশি আছে..."
                      }
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                      rows={5}
                      disabled={isRecording}
                    />
                    <button
                      onClick={
                        isRecording ? stopRecording : handleSpeechRecognition
                      }
                      className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all duration-200 ${
                        isRecording
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                      }`}
                      title={isRecording ? "Stop Recording" : "Voice Input"}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    {symptoms && (
                      <button
                        onClick={() => setSymptoms("")}
                        className="absolute bottom-3 right-14 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Clear text"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>{" "}
                  {isRecording && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
                      Recording... Speak clearly (will auto-analyze)
                    </p>
                  )}{" "}
                </div>
                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !symptoms.trim() || isRecording}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold shadow-lg mb-6"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Analyze Symptoms
                    </>
                  )}
                </Button>
                {/* Guidelines */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Tips for Better Analysis
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Be specific about your symptoms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Include duration and severity
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Mention any relevant medical history
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Use voice input for convenience
                    </li>
                  </ul>
                </div>
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="space-y-6">
              {" "}
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Analyze New Symptoms
                </Button>
                <Button variant="outline" size="sm" className="sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
              {/* Critical Warning */}
              {prediction.is_critical && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                        ⚠️ Critical Warning
                      </h3>
                      <p className="text-red-800 dark:text-red-200 text-sm">
                        This appears to be a critical condition. Please consult
                        a doctor immediately or seek emergency medical care.
                      </p>
                    </div>
                  </div>
                </div>
              )}{" "}
              {/* Analysis Results */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        🤖 AI Medical Analysis
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Generated by Gemini AI •{" "}
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {/* Display Diagnosis Sections */}
                  <div className="space-y-4">
                    {diagnosisSections.map((section, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                      >
                        {" "}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {section.title.includes("CONDITIONS") && (
                              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                            {section.title.includes("RISK") && (
                              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            )}
                            {section.title.includes("ADVICE") && (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                            {section.title.includes("MEDICINES") && (
                              <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                            {!section.title.includes("CONDITIONS") &&
                              !section.title.includes("RISK") &&
                              !section.title.includes("ADVICE") &&
                              !section.title.includes("MEDICINES") && (
                                <Brain className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {section.title}
                              </h4>
                              <button
                                onClick={() => {
                                  if (playingSection === index) {
                                    stopAudio();
                                  } else {
                                    playTextAsAudio(
                                      `${section.title}: ${section.content}`,
                                      index
                                    );
                                  }
                                }}
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  playingSection === index
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                                title={
                                  playingSection === index
                                    ? "Stop audio"
                                    : "Listen to this section"
                                }
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                              {section.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>{" "}
                  {/* AI Generation Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                          <span className="whitespace-nowrap">
                            Powered by Gemini AI
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (currentAudio) {
                              stopAudio();
                            } else {
                              const fullText = diagnosisSections
                                .map((s) => `${s.title}: ${s.content}`)
                                .join("\n\n");
                              playTextAsAudio(fullText, -1);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                            currentAudio && playingSection === -1
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          <Volume2 className="w-3 h-3 flex-shrink-0" />
                          <span>
                            {currentAudio && playingSection === -1
                              ? "Stop"
                              : "Read All"}
                          </span>
                        </button>
                      </div>{" "}
                      {/* Language Switch */}
                      {prediction.language !== "en" &&
                        prediction.english_version && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const englishSections = parseDiagnosis(
                                prediction.english_version!
                              );
                              setPrediction((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      diagnosis: prediction.english_version!,
                                      language: "en",
                                    }
                                  : null
                              );
                            }}
                            className="flex items-center gap-2 whitespace-nowrap"
                          >
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">
                              Show in English
                            </span>
                            <span className="sm:hidden">English</span>
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Medical Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                      Important Medical Disclaimer
                    </h3>
                    <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                      {prediction.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
