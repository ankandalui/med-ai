"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import Lottie from "lottie-react";

interface VoiceAssistantResponse {
  response: string;
  action: "navigation" | "task" | "medical_advice" | "emergency" | "error";
  navigationUrl: string | null;
  taskType: string | null;
  urgencyLevel: "low" | "medium" | "high" | "critical";
}

interface VoiceAssistantProps {
  onClose: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

export function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load animation data
  useEffect(() => {
    fetch("/animations/voice.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load voice animation:", err));
  }, []);

  // Load voices and setup speech synthesis
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voicesRef.current = voices;
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log("Voices loaded:", voices);
      }
    };

    // Load voices when they become available
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Try immediately

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition() as SpeechRecognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLanguageCode(i18n.language);

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setResponse("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceCommand(text);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setResponse(t("voiceAssistant.errors.noSpeech"));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [i18n.language]);

  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "bn":
        return "bn-BD";
      default:
        return "en-US";
    }
  };

  const getVoiceForLanguage = (lang: string) => {
    if (!voicesLoaded) return null;

    const langCode = getLanguageCode(lang);
    const voices = voicesRef.current;

    // Try to find a native voice first
    const nativeVoice = voices.find((v) => v.lang === langCode);
    if (nativeVoice) return nativeVoice;

    // Fallback to any voice with the language
    const langVoice = voices.find((v) =>
      v.lang.startsWith(langCode.substring(0, 2))
    );
    if (langVoice) return langVoice;

    // Fallback to default voice
    return voices.find((v) => v.default) || voices[0];
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
        setResponse(t("voiceAssistant.errors.microphone"));
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceCommand = async (text: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: i18n.language,
          userType:
            user?.userType === "HEALTH_WORKER" ? "HEALTH_WORKER" : "patient",
          currentPage: pathname,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantResponse: VoiceAssistantResponse = data.data;
        setResponse(assistantResponse.response);

        // Handle navigation
        if (
          assistantResponse.action === "navigation" &&
          assistantResponse.navigationUrl
        ) {
          setTimeout(() => {
            router.push(assistantResponse.navigationUrl!);
          }, 2000);
        }

        // Speak the response
        speakResponse(assistantResponse.response);
      } else {
        setResponse(t("voiceAssistant.errors.processing"));
        speakResponse(t("voiceAssistant.errors.processing"));
      }
    } catch (error) {
      console.error("Voice command error:", error);
      setResponse(t("voiceAssistant.errors.networkError"));
      speakResponse(t("voiceAssistant.errors.networkError"));
    }

    setIsProcessing(false);
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported");
      setResponse((prev) => prev + " (Voice not supported)");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Set the voice for the current language
    const voice = getVoiceForLanguage(i18n.language);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = getLanguageCode(i18n.language);
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      console.log("Speech started:", text);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      console.log("Speech ended");
    };

    utterance.onerror = (e) => {
      setIsPlaying(false);
      console.error("Speech error:", e);
      setResponse((prev) => prev + " (Voice output failed)");
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Error speaking:", err);
      setIsPlaying(false);
      setResponse((prev) => prev + " (Voice error)");
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleManualGreeting = () => {
    const greeting = t("voiceAssistant.greeting");
    speakResponse(greeting);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            <span className="font-semibold text-sm">
              {t("voiceAssistant.title")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fallback: Button to manually play greeting if needed */}
        <div className="text-center mt-2">
          <button
            onClick={handleManualGreeting}
            className="text-xs text-blue-600 underline"
          >
            Can't hear greeting? Tap to play again
          </button>
        </div>

        {/* Animation and Status */}
        <div className="p-4 text-center">
          <div className="mb-4 flex justify-center">
            {animationData ? (
              <div className="relative">
                <Lottie
                  animationData={animationData}
                  loop={isListening || isProcessing || isPlaying}
                  autoplay={isListening || isProcessing || isPlaying}
                  style={{ width: 120, height: 80 }}
                />
                {/* Overlay icon for state indication */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : isListening ? (
                    <Mic className="w-6 h-6 text-red-600 animate-pulse" />
                  ) : isPlaying ? (
                    <Volume2 className="w-6 h-6 text-green-600 animate-bounce" />
                  ) : null}
                </div>
              </div>
            ) : (
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-gradient-to-r from-red-400 to-pink-500 animate-pulse"
                    : isProcessing
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 animate-spin"
                    : isPlaying
                    ? "bg-gradient-to-r from-green-400 to-blue-500 animate-bounce"
                    : "bg-gradient-to-r from-blue-400 to-purple-500"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : isListening ? (
                  <Mic className="w-8 h-8 text-white animate-pulse" />
                ) : isPlaying ? (
                  <Volume2 className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="mb-4 min-h-[2rem]">
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {t("voiceAssistant.processing")}
                </span>
              </div>
            ) : isListening ? (
              <p className="text-sm text-green-600 font-medium">
                🎤 {t("voiceAssistant.listening")}
              </p>
            ) : isPlaying ? (
              <p className="text-sm text-purple-600 font-medium">
                🔊 {t("voiceAssistant.speaking")}
              </p>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t("voiceAssistant.tapToStart")}
              </p>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">
                  {t("voiceAssistant.youSaid")}
                </span>{" "}
                "{transcript}"
              </p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <span className="font-medium">
                  {t("voiceAssistant.assistant")}
                </span>{" "}
                {response}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center gap-3">
            {!isListening ? (
              <button
                onClick={startListening}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm">{t("voiceAssistant.start")}</span>
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <MicOff className="w-4 h-4" />
                <span className="text-sm">{t("voiceAssistant.stop")}</span>
              </button>
            )}

            {isPlaying && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">{t("voiceAssistant.mute")}</span>
              </button>
            )}
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("voiceAssistant.examples")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
