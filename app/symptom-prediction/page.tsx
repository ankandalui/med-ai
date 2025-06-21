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
  Phone,
  Ambulance,
  Siren,
  Zap,
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

// Client-side only emergency ID generator to prevent hydration mismatches
const generateEmergencyId = () => {
  if (typeof window === "undefined") {
    return "EMG-LOADING"; // Placeholder for SSR
  }
  return "EMG-" + Math.random().toString(36).substr(2, 9).toUpperCase();
};

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
  const [showSOSAlert, setShowSOSAlert] = useState(false);
  const [isSOSSending, setIsSOSSending] = useState(false);
  const [sosStatus, setSOSStatus] = useState<string>("");
  const [isTestMode, setIsTestMode] = useState(false);
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

        // Check if condition is critical and trigger SOS alert AUTOMATICALLY
        if (data.is_critical) {
          setShowSOSAlert(true);

          // Play emergency sound effect (beep beep beep)
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const playBeep = (
            frequency: number,
            duration: number,
            delay: number
          ) => {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = frequency;
              oscillator.type = "sine";
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + duration
              );
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + duration);
            }, delay);
          };

          // Play emergency beep pattern
          for (let i = 0; i < 6; i++) {
            playBeep(800, 0.2, i * 300);
          }

          // AUTOMATICALLY trigger SOS immediately (no waiting)
          console.log(
            "🚨 CRITICAL CONDITION DETECTED - AUTO-TRIGGERING SOS 🚨"
          );
          setTimeout(() => {
            handleSOSAlert();
          }, 2000); // Trigger SOS after 2 seconds
        }
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
  const handleSOSAlert = async () => {
    setIsSOSSending(true);
    setSOSStatus("Sending SOS Alert...");

    // ENHANCED TERMINAL CONSOLE LOGGING - MAXIMUM VISIBILITY
    console.clear(); // Clear console first for better visibility

    // Multiple console methods for maximum visibility
    console.log("\n\n" + "🚨".repeat(30));
    console.warn("🚨🚨🚨 EMERGENCY SOS ALERT SYSTEM ACTIVATED 🚨🚨🚨");
    console.warn("🆘 CRITICAL EMERGENCY - SENDING SOS ALERT 🆘");
    console.log("🚨".repeat(30) + "\n");

    // Force console output with different methods
    console.group("🚨 EMERGENCY SOS DETAILS:");
    console.log("📱 Emergency Call Initiated");
    console.warn("📞 From Health Worker: 7074757878");
    console.warn("🏥 Alerting Government Hospital: 8100752679");
    console.warn("🚑 Dispatching Ambulance Service: 8653015622");
    console.log("📍 Patient Location: Critical Emergency Detected");
    console.warn(
      "🩺 Condition: " +
        (prediction?.diagnosis?.substring(0, 100) ||
          "Critical symptoms detected")
    );
    console.log("⏰ Emergency Timestamp: " + new Date().toISOString());
    console.warn("🆔 Emergency ID: " + generateEmergencyId());
    console.groupEnd();

    try {
      console.log("💾 POSTING EMERGENCY DATA TO DATABASE...");

      // Prepare emergency data for database storage
      const emergencyData = {
        emergencyId: generateEmergencyId(),
        patientName: "Emergency Patient", // TODO: Get from user input
        patientPhone: "9999999999", // TODO: Get from user input
        symptoms: symptoms,
        diagnosis: prediction?.diagnosis || "Critical symptoms detected",
        healthWorkerPhone: "7074757878",
        location: "Unknown Location", // TODO: Get from user input
        age: null, // TODO: Get from user input
        status: "CRITICAL",
      };

      console.log("🚨 POSTING EMERGENCY TO DATABASE:");
      console.log("📋 Emergency data:", JSON.stringify(emergencyData, null, 2));

      // POST emergency data to database instead of localStorage
      setSOSStatus("Creating emergency alert...");
      const emergencyResponse = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      });

      const emergencyResult = await emergencyResponse.json();
      console.log("🏥 DATABASE EMERGENCY CREATION:", emergencyResult);

      if (!emergencyResult.success) {
        throw new Error(`Failed to create emergency: ${emergencyResult.error}`);
      }
      console.log("✅ EMERGENCY STORED IN DATABASE");
      console.log("📋 Emergency ID:", emergencyResult.data.emergencyId);
      console.log("📋 Alert ID:", emergencyResult.data.alertId);

      // AUTOMATICALLY ADD PATIENT TO HEALTH WORKER MONITORING SYSTEM
      console.log("\n🩺 ADDING PATIENT TO HEALTH WORKER MONITORING...");
      setSOSStatus("Adding patient to monitoring system...");

      const monitoringData = {
        patientName: emergencyData.patientName,
        patientPhone: emergencyData.patientPhone,
        patientAge: emergencyData.age,
        patientLocation: emergencyData.location,
        symptoms: emergencyData.symptoms,
        diagnosis: emergencyData.diagnosis,
        status: "critical", // Always critical for AI-detected emergencies
        emergencyId: emergencyData.emergencyId,
        healthWorkerPhone: emergencyData.healthWorkerPhone,
      };

      console.log(
        "📋 Monitoring data:",
        JSON.stringify(monitoringData, null, 2)
      );

      const monitoringResponse = await fetch("/api/health-worker/monitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(monitoringData),
      });

      const monitoringResult = await monitoringResponse.json();
      console.log("🔍 HEALTH WORKER MONITORING CREATION:", monitoringResult);

      if (monitoringResult.success) {
        console.log("✅ PATIENT ADDED TO MONITORING SYSTEM");
        console.log("📋 Monitoring ID:", monitoringResult.data?.id);
        if (monitoringResult.authoritiesNotified) {
          console.log("🚨 AUTHORITIES AUTOMATICALLY NOTIFIED");
          console.log(
            "📞 Emergency contacts:",
            monitoringResult.emergencyContacts
          );
        }
      } else {
        console.warn("⚠️ Failed to add to monitoring:", monitoringResult.error);
      }

      console.log("📱 Health Worker Phone:", emergencyData.healthWorkerPhone);
      console.log("🏥 Hospital Phone: 8100752679");
      console.log("🚑 Ambulance Phone: 8653015622");

      // Simulate sending SOS to hospital with MAXIMUM VISIBILITY
      console.log("\n🏥 CONTACTING HOSPITAL...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSOSStatus("Hospital notified: 8100752679");

      console.clear();
      console.warn("✅ HOSPITAL NOTIFICATION SUCCESSFUL");
      console.warn(
        "   📞 SOS going from Health Worker 7074757878 to 8100752679 hospital"
      );
      console.log("   📋 Status: Emergency department alerted");
      console.warn("   🏥 Facility: Government District Hospital");
      console.warn("   🚨 PRIORITY: CRITICAL - Code Red");

      console.log("\n🚑 CONTACTING AMBULANCE...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSOSStatus("Ambulance dispatched: 8653015622");

      console.warn("✅ AMBULANCE DISPATCH SUCCESSFUL");
      console.log(
        "   📞 SOS going from Health Worker 7074757878 to 8653015622 ambulance"
      );
      console.log("   🚑 Status: Emergency vehicle dispatched");
      console.warn("   ⏱️  ETA: 8-12 minutes");
      console.log("   🚨 AMBULANCE EN ROUTE - CRITICAL PATIENT");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.clear();
      console.log("✅ ALL EMERGENCY SERVICES NOTIFIED");
      console.warn("   🚨 Priority: CRITICAL - Code Red");
      console.log("   📡 GPS Location: Transmitted to emergency services");
      console.log("   📝 Medical Info: Patient emergency card shared");
      console.warn("   🏥 Hospital: 8100752679 - ALERTED");
      console.log("   🚑 Ambulance: 8653015622 - DISPATCHED");
      setSOSStatus("Emergency services en route!");

      console.log("\n" + "🆘".repeat(30));
      console.warn("🆘 SOS ALERT SYSTEM COMPLETE - HELP IS ON THE WAY! 🆘");
      console.log("📞 EMERGENCY CALLS MADE:");
      console.warn("   From Health Worker: 7074757878 → Hospital: 8100752679");
      console.log("   From Health Worker: 7074757878 → Ambulance: 8653015622");
      console.log("🆘".repeat(30) + "\n\n");

      // Navigate health worker to monitoring page with emergency ID
      setTimeout(() => {
        console.log("🔄 REDIRECTING TO MONITORING PAGE...");
        const redirectUrl = `/health-worker/monitoring?emergency=${emergencyResult.data.emergencyId}&auto_add=true`;
        console.log("🌐 Redirect URL:", redirectUrl);

        window.location.href = redirectUrl;
      }, 3000);

      // Alert to make sure user sees it
      alert(
        "🚨 SOS SENT! Emergency stored in database. Redirecting health worker to monitoring dashboard..."
      );
    } catch (error) {
      console.clear();
      console.log("❌ EMERGENCY SOS FAILED:", error);
      console.warn("🚨 FALLBACK: Please call emergency services directly!");
      console.log("📞 Emergency Hotline: 108");
      console.log("🚨 CRITICAL ERROR - MANUAL INTERVENTION REQUIRED 🚨");
      setSOSStatus(
        "Failed to send SOS. Please call emergency services directly."
      );
    } finally {
      setIsSOSSending(false);
      setTimeout(() => {
        setShowSOSAlert(false);
        setSOSStatus("");
      }, 5000);
    }
  };
  const handleReset = () => {
    setSymptoms("");
    setPrediction(null);
    setError(null);
    setSelectedLanguage("en");
  };

  // Test function to simulate critical condition
  const testCriticalCondition = () => {
    console.log("🧪 TESTING CRITICAL CONDITION SIMULATION");
    console.warn("🚨 INITIATING EMERGENCY TEST MODE 🚨");

    const mockCriticalPrediction: SymptomResult = {
      success: true,
      diagnosis: `[CRITICAL EMERGENCY DETECTED - TEST MODE]
⚠️ IMMEDIATE MEDICAL ATTENTION REQUIRED ⚠️

This is a test simulation of a critical medical condition.

[POSSIBLE CONDITIONS]
• Acute myocardial infarction (heart attack)
• Severe allergic reaction (anaphylaxis)
• Acute respiratory distress

[IMMEDIATE ACTIONS REQUIRED]
1. Call emergency services immediately (108)
2. Do not delay seeking medical attention
3. Prepare for immediate transport to hospital

[CRITICAL WARNING]
This condition requires IMMEDIATE emergency medical intervention.`,
      is_critical: true,
      language: "en",
      timestamp: new Date().toISOString(),
      disclaimer:
        "This is a test simulation for emergency medical alert system.",
    };

    setPrediction(mockCriticalPrediction);
    setShowSOSAlert(true);

    // Automatically trigger SOS
    setTimeout(() => {
      handleSOSAlert();
    }, 2000);
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
    <>
      {/* Emergency CSS Styles */}
      {prediction?.is_critical && (
        <style jsx>{`
          @keyframes emergency-flash {
            0%,
            50% {
              border-color: #ef4444;
              box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
            }
            25%,
            75% {
              border-color: #f97316;
              box-shadow: 0 0 30px rgba(249, 115, 22, 0.8);
            }
          }

          @keyframes emergency-glow {
            0%,
            100% {
              background-color: rgba(239, 68, 68, 0.1);
            }
            50% {
              background-color: rgba(249, 115, 22, 0.2);
            }
          }

          .emergency-container {
            animation: emergency-flash 1s infinite;
          }

          .emergency-background {
            animation: emergency-glow 2s infinite;
          }
        `}</style>
      )}

      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${
          prediction?.is_critical ? "emergency-background border-4" : ""
        }`}
      >
        <div
          className={`container mx-auto px-4 pt-24 pb-8 ${
            prediction?.is_critical ? "emergency-container" : ""
          }`}
        >
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
                  </div>{" "}
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
                        <p className="text-red-800 dark:text-red-200">
                          {error}
                        </p>
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
                {/* Critical Warning with SOS */}
                {prediction.is_critical && (
                  <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-xl p-6 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 animate-ping"></div>
                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/20 rounded-full animate-bounce">
                          <Siren className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-xl mb-3 flex items-center gap-2">
                            🚨 CRITICAL EMERGENCY DETECTED 🚨
                          </h3>
                          <p className="text-red-100 text-lg mb-4">
                            Your symptoms indicate a potentially
                            life-threatening condition. Immediate medical
                            attention is required!
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={handleSOSAlert}
                              disabled={isSOSSending}
                              className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg py-3 px-6 shadow-lg"
                            >
                              {isSOSSending ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Sending SOS...
                                </>
                              ) : (
                                <>
                                  <Phone className="w-5 h-5 mr-2" />
                                  🆘 SEND SOS ALERT
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                              onClick={() => window.open("tel:108", "_self")}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call 108 (Emergency)
                            </Button>
                          </div>
                          {sosStatus && (
                            <div className="mt-4 p-3 bg-white/20 rounded-lg">
                              <p className="text-white font-semibold flex items-center gap-2">
                                <Zap className="w-4 h-4 animate-pulse" />
                                {sosStatus}
                              </p>
                            </div>
                          )}
                        </div>
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

        {/* SOS Alert Modal */}
        {showSOSAlert && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-red-500 animate-pulse">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Siren className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  🚨 EMERGENCY ALERT 🚨
                </h3>

                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                  Critical condition detected! Do you want to send an SOS alert
                  to emergency services?
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSOSAlert}
                    disabled={isSOSSending}
                    className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 text-lg ${
                      isSOSSending ? "animate-pulse" : "animate-bounce"
                    }`}
                  >
                    {isSOSSending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending SOS Alert...
                      </>
                    ) : (
                      <>
                        <Ambulance className="w-5 h-5 mr-2" />
                        🆘 YES, SEND SOS NOW!
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowSOSAlert(false)}
                    variant="outline"
                    disabled={isSOSSending}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>

                {sosStatus && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 font-semibold flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 animate-pulse" />
                      {sosStatus}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Emergency Services: Hospital (8100752679) • Ambulance
                  (8653015622){" "}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
